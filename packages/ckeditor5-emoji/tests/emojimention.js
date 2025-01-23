/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, console */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { EmojiMention, EmojiPicker } from '../src/index.js';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import EmojiDatabase from '../src/emojidatabase.js';

class EmojiDatabaseMock extends EmojiDatabase {
	// Overridden `init()` to prevent the `fetch()` call.
	init() {
		this.getEmojiBySearchQuery = sinon.stub();
		this.getEmojiGroups = sinon.stub();
		this.isDatabaseLoaded = sinon.stub();

		// Let's define a default behavior as we need this in UI, but we do not check it.
		this.getEmojiGroups.returns( [
			{
				title: 'Smileys & Expressions',
				icon: '😀',
				items: []
			}
		] );

		this.isDatabaseLoaded.returns( EmojiDatabaseMock.isDatabaseLoaded );
	}

	// Property exposed for testing purposes to control the plugin initialization flow.
	static isDatabaseLoaded = true;
}

describe( 'EmojiMention', () => {
	testUtils.createSinonSandbox();

	let editor, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		EmojiDatabaseMock.isDatabaseLoaded = true;

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ EmojiMention, EmojiPicker, Paragraph, Essentials, Mention ],
			substitutePlugins: [ EmojiDatabaseMock ]
		} );
	} );

	afterEach( async () => {
		await editor.destroy();
		editorElement.remove();
	} );

	it( 'should be correctly named', () => {
		expect( EmojiMention.pluginName ).to.equal( 'EmojiMention' );
	} );

	it( 'should have proper "requires" value', () => {
		expect( EmojiMention.requires ).to.deep.equal( [ EmojiDatabase, 'Mention' ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmojiMention.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmojiMention.isPremiumPlugin ).to.be.false;
	} );

	describe( 'integrations with other plugins', () => {
		let consoleWarnStub;

		beforeEach( () => {
			consoleWarnStub = sinon.stub( console, 'warn' );
		} );

		afterEach( () => {
			consoleWarnStub.restore();
		} );

		it( 'should update the mention configuration if it not defined when creating the editor', () => {
			const configs = editor.config.get( 'mention.feeds' );

			expect( configs.length ).to.equal( 1 );

			const config = configs[ 0 ];

			expect( config.marker ).to.equal( ':' );
			expect( config.dropdownLimit ).to.equal( 6 );
			expect( config.itemRenderer ).to.be.instanceOf( Function );
			expect( config.feed ).to.be.instanceOf( Function );
		} );

		it( 'should update the mention configuration if the existing configuration does not use the `:` character', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, EmojiPicker, Paragraph, Essentials, Mention ],
				substitutePlugins: [ EmojiDatabaseMock ],
				mention: {
					feeds: [
						{
							marker: '@',
							feed: [ '@Barney', '@Lily', '@Marry Ann', '@Marshall', '@Robin', '@Ted' ],
							minimumCharacters: 1
						}
					]
				}
			} );

			const configs = editor.config.get( 'mention.feeds' );

			expect( configs.length ).to.equal( 2 );

			const config = configs.find( config => config.marker !== '@' );

			expect( config.marker ).to.equal( ':' );
			expect( config.dropdownLimit ).to.equal( 6 );
			expect( config.itemRenderer ).to.be.instanceOf( Function );
			expect( config.feed ).to.be.instanceOf( Function );

			await editor.destroy();
			editorElement.remove();
		} );

		it( 'should not update the mention configuration when the `:` character is already used', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, EmojiPicker, Paragraph, Essentials, Mention ],
				substitutePlugins: [ EmojiDatabaseMock ],
				mention: {
					feeds: [
						{
							marker: ':',
							feed: [ ':Barney', ':Lily', ':Marry Ann', ':Marshall', ':Robin', ':Ted' ],
							minimumCharacters: 1
						}
					]
				}
			} );

			const configs = editor.config.get( 'mention.feeds' );

			expect( configs.length ).to.equal( 1 );

			const config = configs[ 0 ];

			expect( config.marker ).to.equal( ':' );
			expect( config.feed ).to.deep.equal( [ ':Barney', ':Lily', ':Marry Ann', ':Marshall', ':Robin', ':Ted' ] );
			expect( config.minimumCharacters ).to.equal( 1 );

			expect( config.dropdownLimit ).to.equal( undefined );
			expect( config.itemRenderer ).to.equal( undefined );

			expect( consoleWarnStub.callCount ).to.equal( 1 );
			expect( consoleWarnStub.firstCall.firstArg ).to.equal( 'emoji-config-marker-already-used' );

			await editor.destroy();
			editorElement.remove();
		} );

		it( 'should not update the mention configuration when the Merge fields feature use the `:` character', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, EmojiPicker, Paragraph, Essentials, Mention ],
				substitutePlugins: [ EmojiDatabaseMock ],
				mergeFields: {
					prefix: ':'
				}
			} );

			const configs = editor.config.get( 'mention.feeds' );

			expect( configs.length ).to.equal( 0 );

			expect( consoleWarnStub.callCount ).to.equal( 1 );
			expect( consoleWarnStub.firstCall.firstArg ).to.equal( 'emoji-config-marker-already-used' );

			await editor.destroy();
			editorElement.remove();
		} );
	} );

	describe( '_customItemRendererFactory()', () => {
		let itemRenderer, locale;

		beforeEach( () => {
			locale = {
				t: sinon.stub().callsFake( input => input )
			};

			itemRenderer = editor.plugins.get( 'EmojiMention' )._customItemRendererFactory( locale.t );
		} );

		it( 'should be a function', () => {
			expect( itemRenderer ).to.be.instanceOf( Function );
		} );

		it( 'should render the specified `MentionFeedObjectItem` object properly', () => {
			const item = itemRenderer( { id: ':smiling face:', text: '☺️' } );

			expect( item.nodeName.toLowerCase() ).to.equal( 'button' );

			expect( Array.from( item.classList ) ).to.deep.equal( [ 'ck', 'ck-button', 'ck-button_with-text' ] );
			expect( item.tabIndex ).to.equal( -1 );
			expect( item.type ).to.equal( 'button' );
			expect( item.id ).to.equal( 'mention-list-item-id:smiling face' );
			expect( item.childNodes ).to.have.lengthOf( 1 );

			const { firstChild } = item;

			expect( firstChild.nodeName.toLowerCase() ).to.equal( 'span' );
			expect( Array.from( firstChild.classList ) ).to.deep.equal( [ 'ck', 'ck-button__label' ] );
			expect( firstChild.textContent ).to.equal( '☺️ :smiling face:' );
		} );

		it( 'should render the "Show all emojis" item properly', () => {
			const item = itemRenderer( { id: ':__EMOJI_SHOW_ALL:' } );

			expect( item.nodeName.toLowerCase() ).to.equal( 'button' );

			expect( Array.from( item.classList ) ).to.deep.equal( [ 'ck', 'ck-button', 'ck-button_with-text' ] );
			expect( item.tabIndex ).to.equal( -1 );
			expect( item.type ).to.equal( 'button' );
			expect( item.id ).to.equal( 'mention-list-item-id:__EMOJI_SHOW_ALL' );
			expect( item.childNodes ).to.have.lengthOf( 1 );

			const { firstChild } = item;

			expect( firstChild.nodeName.toLowerCase() ).to.equal( 'span' );
			expect( Array.from( firstChild.classList ) ).to.deep.equal( [ 'ck', 'ck-button__label' ] );
			expect( firstChild.textContent ).to.equal( 'Show all emoji...' );

			expect( locale.t.callCount ).to.equal( 1 );
			expect( locale.t.firstCall.firstArg ).to.equal( 'Show all emoji...' );
		} );

		it( 'should render the "Keep on typing..." item properly', () => {
			const item = itemRenderer( { id: ':__EMOJI_HINT:' } );

			expect( item.nodeName.toLowerCase() ).to.equal( 'button' );

			expect( Array.from( item.classList ) ).to.deep.equal( [
				'ck',
				'ck-button',
				'ck-button_with-text',
				'ck-list-item-button',
				'ck-disabled'
			] );
			expect( item.tabIndex ).to.equal( -1 );
			expect( item.type ).to.equal( 'button' );
			expect( item.id ).to.equal( 'mention-list-item-id:__EMOJI_HINT' );
			expect( item.childNodes ).to.have.lengthOf( 1 );

			const { firstChild } = item;

			expect( firstChild.nodeName.toLowerCase() ).to.equal( 'span' );
			expect( Array.from( firstChild.classList ) ).to.deep.equal( [ 'ck', 'ck-button__label' ] );
			expect( firstChild.textContent ).to.equal( 'Keep on typing to see the emoji.' );

			expect( locale.t.callCount ).to.equal( 1 );
			expect( locale.t.firstCall.firstArg ).to.equal( 'Keep on typing to see the emoji.' );
		} );
	} );

	describe( '_overrideMentionExecuteListener()', () => {
		beforeEach( () => {
			const { getEmojiBySearchQuery } = editor.plugins.get( 'EmojiDatabase' );
			getEmojiBySearchQuery.returns( [
				{
					annotation: 'raising hands',
					emoji: '🙌',
					skins: {
						default: '🙌'
					}
				}
			] );
		} );

		it( 'must not override the default mention command execution for non-emoji auto-complete selection', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, EmojiPicker, Paragraph, Essentials, Mention ],
				substitutePlugins: [ EmojiDatabaseMock ],
				mention: {
					feeds: [
						{
							marker: '@',
							feed: [ '@Barney', '@Lily', '@Marry Ann', '@Marshall', '@Robin', '@Ted' ],
							minimumCharacters: 1
						}
					]
				}
			} );

			setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>Hello world! []</paragraph>' );

			editor.commands.execute( 'mention', {
				marker: '@',
				mention: { id: '@Barney' },
				text: 'Barney',
				range: editor.model.document.selection.getFirstRange()
			} );

			expect( getModelData( editor.model ) ).to.match(
				// eslint-disable-next-line max-len
				/<paragraph>Hello world! <\$text mention="{"uid":"[a-z0-9]+","_text":"Barney","id":"@Barney"}">Barney<\/\$text> \[\]<\/paragraph>/
			);

			await editor.destroy();
			editorElement.remove();
		} );

		it( 'must not override the default mention command execution if emoji database is not loaded', async () => {
			EmojiDatabaseMock.isDatabaseLoaded = false;

			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, EmojiPicker, Paragraph, Essentials, Mention ],
				substitutePlugins: [ EmojiDatabaseMock ]
			} );

			setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

			const { startPosition, endPosition } = simulateTyping( ':raising' );

			const range = editor.model.change( writer => {
				return writer.createRange( startPosition, endPosition );
			} );

			// Expect an error from mention plugin if emoji plugin does not override the `mention` command execution.
			expectToThrowCKEditorError(
				() => editor.commands.execute( 'mention', { range, mention: { id: 'emoji:raising_hands:', text: '🙌' } } ),
				/mentioncommand-incorrect-id/,
				editor
			);

			await editor.destroy();
			editorElement.remove();
		} );

		describe( 'break the command execution', () => {
			it( 'should stop the "mention" command when inserting an item from the list', () => {
				setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

				const range = editor.model.document.selection.getFirstRange();

				let eventStop;

				editor.commands.get( 'mention' ).on( 'execute', event => {
					eventStop = event.stop;
				}, { priority: 'highest' } );

				editor.commands.execute( 'mention', {
					range,
					marker: ':',
					mention: { id: ':raising hands:', text: '🙌' }
				} );

				expect( eventStop.called ).to.equal( true );
			} );

			it( 'should stop the "mention" command when selecting the "Keep on typing..." option', () => {
				setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

				const range = editor.model.document.selection.getFirstRange();

				let eventStop;

				editor.commands.get( 'mention' ).on( 'execute', event => {
					eventStop = event.stop;
				}, { priority: 'highest' } );

				editor.commands.execute( 'mention', {
					range,
					marker: ':',
					mention: { id: ':__EMOJI_SHOW_ALL:' }
				} );

				expect( eventStop.called ).to.equal( true );
			} );

			it( 'should stop the "mention" command when selecting the "Show all emoji" option', () => {
				setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

				const range = editor.model.document.selection.getFirstRange();

				let eventStop;

				editor.commands.get( 'mention' ).on( 'execute', event => {
					eventStop = event.stop;
				}, { priority: 'highest' } );

				editor.commands.execute( 'mention', {
					range,
					marker: ':',
					mention: { id: ':__EMOJI_HINT:' }
				} );

				expect( eventStop.called ).to.equal( true );

				expect( getModelData( editor.model ) ).to.equal( '<paragraph>Hello world! []</paragraph>' );
			} );
		} );

		it( 'should remove the auto-complete query when selecting an item from the list', () => {
			setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>Hello world! []</paragraph>' );

			const { startPosition, endPosition } = simulateTyping( ':raising' );

			const range = editor.model.change( writer => {
				return writer.createRange( startPosition, endPosition );
			} );

			editor.commands.execute( 'mention', {
				range,
				marker: ':',
				mention: { id: ':raising hands:', text: '🙌' }
			} );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>Hello world! 🙌[]</paragraph>' );
		} );

		it( 'should remove the auto-complete query when selecting the "Show all emoji" option from the list', () => {
			setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>Hello world! []</paragraph>' );

			const { startPosition, endPosition } = simulateTyping( ':raising' );

			const range = editor.model.change( writer => {
				return writer.createRange( startPosition, endPosition );
			} );

			editor.commands.execute( 'mention', {
				range,
				marker: ':',
				mention: { id: ':__EMOJI_SHOW_ALL:' }
			} );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>Hello world! []</paragraph>' );
		} );

		it( 'should open the emoji picker UI when selecting the "Show all emojis" option from the list', () => {
			const emojiPicker = editor.plugins.get( 'EmojiPicker' );
			const stub = sinon.stub( emojiPicker, 'showUI' );

			setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>Hello world! []</paragraph>' );

			const { startPosition, endPosition } = simulateTyping( ':raising' );

			const range = editor.model.change( writer => {
				return writer.createRange( startPosition, endPosition );
			} );

			editor.commands.execute( 'mention', {
				range,
				marker: ':',
				mention: { id: ':__EMOJI_SHOW_ALL:' }

			} );

			sinon.assert.calledOnce( stub );
			sinon.assert.calledWith( stub, 'raising' );
		} );
	} );

	describe( '_queryEmojiCallbackFactory()', () => {
		let queryEmoji;

		beforeEach( () => {
			queryEmoji = editor.plugins.get( 'EmojiMention' )._queryEmojiCallbackFactory();
		} );

		it( 'should be a function', () => {
			expect( queryEmoji ).to.be.instanceOf( Function );
		} );

		it( 'should return an empty array when a query starts with a space', () => {
			const { getEmojiBySearchQuery } = editor.plugins.get( 'EmojiDatabase' );
			getEmojiBySearchQuery.returns( [] );

			expect( queryEmoji( ' ' ) ).to.deep.equal( [] );
			expect( queryEmoji( '  ' ) ).to.deep.equal( [] );
			expect( queryEmoji( ' see' ) ).to.deep.equal( [] );
		} );

		it( 'should return a hint item when a query is too short', () => {
			const { getEmojiBySearchQuery } = editor.plugins.get( 'EmojiDatabase' );
			getEmojiBySearchQuery.returns( [] );

			let queryResult = queryEmoji( '' );

			expect( queryResult, 'query is empty' ).to.deep.equal( [
				{ id: ':__EMOJI_HINT:' }
			] );

			queryResult = queryEmoji( 's' );

			expect( queryResult, 'query as a single character' ).to.deep.equal( [
				{ id: ':__EMOJI_HINT:' }
			] );
		} );

		it( 'should pass the specified query to the database plugin', () => {
			const { getEmojiBySearchQuery } = editor.plugins.get( 'EmojiDatabase' );
			getEmojiBySearchQuery.returns( [] );

			queryEmoji( 'see no evil' );

			expect( getEmojiBySearchQuery.callCount ).to.equal( 1 );
			expect( getEmojiBySearchQuery.firstCall.firstArg ).to.equal( 'see no evil' );
		} );

		it( 'should return an array of items that implements the `MentionFeedObjectItem` type', () => {
			const { getEmojiBySearchQuery } = editor.plugins.get( 'EmojiDatabase' );
			getEmojiBySearchQuery.returns( [
				{
					annotation: 'thumbs up',
					emoji: '👍️',
					skins: {
						default: '👍️'
					}
				},
				{
					annotation: 'thumbs down',
					emoji: '👎️',
					skins: {
						default: '👎️'
					}
				}
			] );

			const queryResult = queryEmoji( 'thumbs' );

			expect( queryResult[ 0 ] ).to.deep.equal( { text: '👍️', id: ':thumbs up:' } );
			expect( queryResult[ 1 ] ).to.deep.equal( { text: '👎️', id: ':thumbs down:' } );
		} );

		it( 'should include a "Show all emoji" option when the "EmojiPicker" plugin is available', () => {
			const { getEmojiBySearchQuery } = editor.plugins.get( 'EmojiDatabase' );
			getEmojiBySearchQuery.returns( [] );

			const queryResult = queryEmoji( 'thumbs' );

			expect( queryResult ).to.deep.equal( [
				{ id: ':__EMOJI_SHOW_ALL:' }
			] );
			expect( editor.plugins.has( 'EmojiPicker' ) ).to.equal( true );
		} );

		it( 'should not include the show all emoji button when "EmojiPicker" plugin is not available', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, Mention ],
				substitutePlugins: [ EmojiDatabaseMock ]
			} );

			const { getEmojiBySearchQuery } = editor.plugins.get( 'EmojiDatabase' );

			getEmojiBySearchQuery.returns( [
				{
					annotation: 'thumbs up',
					emoji: '👍️',
					skins: {
						default: '👍️'
					}
				},
				{
					annotation: 'thumbs down',
					emoji: '👎️',
					skins: {
						default: '👎️'
					}
				}
			] );

			const queryEmoji = editor.plugins.get( 'EmojiMention' )._queryEmojiCallbackFactory();
			const queryResult = queryEmoji( 'thumbs' );

			expect( queryResult ).to.deep.equal( [
				{ text: '👍️', id: ':thumbs up:' },
				{ text: '👎️', id: ':thumbs down:' }
			] );
			expect( editor.plugins.has( 'EmojiPicker' ) ).to.equal( false );

			await editor.destroy();
			editorElement.remove();
		} );

		it( 'should return emojis with the proper skin tone when it is selected in the emoji picker plugin', () => {
			const { getEmojiBySearchQuery } = editor.plugins.get( 'EmojiDatabase' );
			const thumbUpItem = {
				annotation: 'thumbs up',
				emoji: '👍️',
				skins: {
					'default': '👍️',
					'light': '👍🏻',
					'medium-light': '👍🏼',
					'medium': '👍🏽',
					'medium-dark': '👍🏾',
					'dark': '👍🏿'
				}
			};

			getEmojiBySearchQuery.returns( [ thumbUpItem ] );

			editor.plugins.get( EmojiPicker ).showUI();
			editor.plugins.get( EmojiPicker )._hideUI();
			editor.plugins.get( EmojiPicker )._emojiPickerView.gridView.skinTone = 'dark';

			const queryResult = queryEmoji( 'thumbs' );

			expect( queryResult.length ).to.equal( 2 );

			expect( queryResult[ 0 ] ).to.deep.equal( {
				id: ':thumbs up:',
				text: thumbUpItem.skins.dark
			} );
		} );

		it( 'should return emojis with the default skin tone when the skin tone is selected but the emoji does not have variants', () => {
			const { getEmojiBySearchQuery } = editor.plugins.get( 'EmojiDatabase' );
			const thumbUpItem = {
				annotation: 'thumbs up',
				emoji: '👍️',
				skins: {
					'default': '👍️'
				}
			};
			getEmojiBySearchQuery.returns( [ thumbUpItem ] );

			editor.plugins.get( EmojiPicker ).showUI();
			editor.plugins.get( EmojiPicker )._hideUI();
			editor.plugins.get( EmojiPicker )._emojiPickerView.gridView.skinTone = 'dark';

			const queryResult = queryEmoji( 'thumbs' );

			expect( queryResult.length ).to.equal( 2 );

			expect( queryResult[ 0 ] ).to.deep.equal( {
				id: ':thumbs up:',
				text: thumbUpItem.skins.default
			} );
		} );

		it( 'should read default skin tone from config', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, EmojiPicker, Paragraph, Essentials, Mention ],
				substitutePlugins: [ EmojiDatabaseMock ],
				emoji: {
					skinTone: 'medium'
				}
			} );

			const { getEmojiBySearchQuery } = editor.plugins.get( 'EmojiDatabase' );
			const thumbUpItem = {
				annotation: 'thumbs up',
				emoji: '👍️',
				skins: {
					'default': '👍️',
					'light': '👍🏻',
					'medium-light': '👍🏼',
					'medium': '👍🏽',
					'medium-dark': '👍🏾',
					'dark': '👍🏿'
				}
			};

			getEmojiBySearchQuery.returns( [ thumbUpItem ] );

			const queryEmoji = editor.plugins.get( 'EmojiMention' )._queryEmojiCallbackFactory();
			const queryResult = queryEmoji( 'thumbs' );

			expect( queryResult.length ).to.equal( 2 );

			expect( queryResult[ 0 ] ).to.deep.equal( {
				id: ':thumbs up:',
				text: thumbUpItem.skins.medium
			} );

			await editor.destroy();
			editorElement.remove();
		} );

		it( 'should use default skin tone if emoji does not have variants and skin tone is specified in config', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, EmojiPicker, Paragraph, Essentials, Mention ],
				substitutePlugins: [ EmojiDatabaseMock ],
				emoji: {
					skinTone: 'medium'
				}
			} );

			const { getEmojiBySearchQuery } = editor.plugins.get( 'EmojiDatabase' );
			const thumbUpItem = {
				annotation: 'thumbs up',
				emoji: '👍️',
				skins: {
					'default': '👍️'
				}
			};

			getEmojiBySearchQuery.returns( [ thumbUpItem ] );

			const queryEmoji = editor.plugins.get( 'EmojiMention' )._queryEmojiCallbackFactory();
			const queryResult = queryEmoji( 'thumbs' );

			expect( queryResult.length ).to.equal( 2 );

			expect( queryResult[ 0 ] ).to.deep.equal( {
				id: ':thumbs up:',
				text: thumbUpItem.skins.default
			} );

			await editor.destroy();
			editorElement.remove();
		} );
	} );

	function simulateTyping( text ) {
		const selection = editor.model.document.selection;
		const startPosition = selection.getFirstRange().start;

		// While typing, every character is an atomic change.
		text.split( '' ).forEach( character => {
			editor.execute( 'input', {
				text: character
			} );
		} );

		const endPosition = selection.getFirstRange().end;

		return { startPosition, endPosition };
	}
} );
