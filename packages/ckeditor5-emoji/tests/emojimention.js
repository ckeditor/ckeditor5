/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Typing } from '@ckeditor/ckeditor5-typing';
import { _getModelData, _setModelData } from '@ckeditor/ckeditor5-engine';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { expectToThrowCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';

import { EmojiMention } from '../src/emojimention.js';
import { EmojiPicker } from '../src/emojipicker.js';
import { EmojiRepository } from '../src/emojirepository.js';

function mockEmojiRepositoryValues( editor ) {
	const repository = editor.plugins.get( 'EmojiRepository' );

	repository.getEmojiByQuery = vi.fn();

	repository.getEmojiCategories = vi.fn().mockReturnValue( [
		{
			title: 'Smileys & Expressions',
			icon: '😀',
			items: []
		},
		{
			title: 'Food & Drinks',
			icon: '🍎',
			items: []
		}
	] );

	repository.getSkinTones = vi.fn().mockReturnValue( [
		{ id: 'default', icon: '👋', tooltip: 'Default skin tone' },
		{ id: 'medium', icon: '👋🏽', tooltip: 'Medium skin tone' },
		{ id: 'dark', icon: '👋🏿', tooltip: 'Dark skin tone' }
	] );
}

describe( 'EmojiMention', () => {
	let editor, editorElement, fetchStub;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		const exampleRepositoryEntry = {
			shortcodes: [
				'grinning'
			],
			annotation: 'grinning face',
			tags: [],
			emoji: '😀',
			order: 1,
			group: 0,
			version: 1
		};

		fetchStub = vi.fn().mockImplementation( () => {
			return new Promise( resolve => {
				const results = JSON.stringify( [ exampleRepositoryEntry ] );

				resolve( new Response( results ) );
			} );
		} );

		vi.spyOn( window, 'fetch' ).mockImplementation( ( ...args ) => fetchStub( ...args ) );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ EmojiMention, EmojiPicker, Paragraph, Essentials, Mention ]
		} );

		mockEmojiRepositoryValues( editor );
	} );

	afterEach( async () => {
		vi.restoreAllMocks();
		await editor.destroy();
		editorElement.remove();
	} );

	it( 'should be correctly named', () => {
		expect( EmojiMention.pluginName ).toBe( 'EmojiMention' );
	} );

	it( 'should have proper "requires" value', () => {
		expect( EmojiMention.requires ).toEqual( [ EmojiRepository, Typing, 'Mention' ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmojiMention.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmojiMention.isPremiumPlugin ).toBe( false );
	} );

	describe( 'integrations with other plugins', () => {
		let consoleWarnStub;

		beforeEach( () => {
			consoleWarnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		} );

		afterEach( () => {
			consoleWarnStub.mockRestore();
		} );

		it( 'should update the mention configuration if it is not defined when creating the editor', () => {
			const configs = editor.config.get( 'mention.feeds' );

			expect( configs.length ).toBe( 1 );

			const config = configs[ 0 ];

			expect( config.marker ).toBe( ':' );
			expect( config.dropdownLimit ).toBe( 6 );
			expect( config.itemRenderer ).toBeInstanceOf( Function );
			expect( config.feed ).toBeInstanceOf( Function );
		} );

		it( 'should update the mention configuration if the existing configuration does not use the `:` character', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, EmojiPicker, Paragraph, Essentials, Mention ],
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

			mockEmojiRepositoryValues( editor );

			const configs = editor.config.get( 'mention.feeds' );

			expect( configs.length ).toBe( 2 );

			const config = configs.find( config => config.marker !== '@' );

			expect( config.marker ).toBe( ':' );
			expect( config._isEmojiMarker ).toBe( true );
			expect( config.dropdownLimit ).toBe( 6 );
			expect( config.itemRenderer ).toBeInstanceOf( Function );
			expect( config.feed ).toBeInstanceOf( Function );

			await editor.destroy();
			editorElement.remove();
		} );

		it( 'should not update the mention configuration when the `:` character is already used', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, EmojiPicker, Paragraph, Essentials, Mention ],
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

			mockEmojiRepositoryValues( editor );

			const configs = editor.config.get( 'mention.feeds' );

			expect( configs.length ).toBe( 1 );

			const config = configs[ 0 ];

			expect( config.marker ).toBe( ':' );
			expect( config.feed ).toEqual( [ ':Barney', ':Lily', ':Marry Ann', ':Marshall', ':Robin', ':Ted' ] );
			expect( config.minimumCharacters ).toBe( 1 );

			expect( config.dropdownLimit ).toBe( undefined );
			expect( config.itemRenderer ).toBe( undefined );

			expect( consoleWarnStub ).toHaveBeenCalledTimes( 1 );
			expect( consoleWarnStub.mock.calls[ 0 ][ 0 ] ).toBe( 'emoji-config-marker-already-used' );

			await editor.destroy();
			editorElement.remove();
		} );

		it( 'should not update the mention configuration when the Merge fields feature use the `:` character', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, EmojiPicker, Paragraph, Essentials, Mention ],
				mergeFields: {
					prefix: ':'
				}
			} );

			mockEmojiRepositoryValues( editor );

			const configs = editor.config.get( 'mention.feeds' );

			expect( configs.length ).toBe( 0 );

			expect( consoleWarnStub ).toHaveBeenCalledTimes( 1 );
			expect( consoleWarnStub.mock.calls[ 0 ][ 0 ] ).toBe( 'emoji-config-marker-already-used' );

			await editor.destroy();
			editorElement.remove();
		} );
	} );

	it( 'should set emoji mention feed configuration only once', async () => {
		const editorElement = document.createElement( 'div' );
		const editor1Element = document.createElement( 'div' );
		document.body.appendChild( editorElement );
		document.body.appendChild( editor1Element );

		const editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ EmojiMention, Mention ]
		} );

		const editor1 = await ClassicTestEditor.create( editor1Element, {
			plugins: [ EmojiMention, Mention ],
			mention: {
				feeds: editor.config.get( 'mention.feeds' )
			}
		} );

		// Should register emoji mention config only once.
		expect( editor1.config.get( 'mention.feeds' ).length ).toBe( 1 );

		await editor.destroy();
		await editor1.destroy();
		editorElement.remove();
		editor1Element.remove();
	} );

	it( 'should not update the mention configuration when emoji configuration is already added', async () => {
		const consoleWarnStub = vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		const editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ EmojiMention, Mention ]
		} );

		expect( editor.config.get( 'mention.feeds' ).length ).toBe( 1 );

		editor.plugins.get( 'EmojiMention' )._setupMentionConfiguration( editor );

		// Should not call console warn when there are no mention or merge fields configs defined.
		expect( consoleWarnStub ).not.toHaveBeenCalled();
		expect( editor.config.get( 'mention.feeds' ).length ).toBe( 1 );

		await editor.destroy();
		editorElement.remove();
		consoleWarnStub.mockRestore();
	} );

	describe( '_customItemRendererFactory()', () => {
		let itemRenderer, locale;

		beforeEach( () => {
			locale = {
				t: vi.fn( input => input )
			};

			itemRenderer = editor.plugins.get( 'EmojiMention' )._customItemRendererFactory( locale.t );
		} );

		it( 'should be a function', () => {
			expect( itemRenderer ).toBeInstanceOf( Function );
		} );

		it( 'should render the specified `MentionFeedObjectItem` object properly', () => {
			const item = itemRenderer( { id: ':smiling face:', text: '☺️' } );

			expect( item.nodeName.toLowerCase() ).toBe( 'button' );

			expect( Array.from( item.classList ) ).toEqual( [ 'ck', 'ck-button', 'ck-button_with-text' ] );
			expect( item.tabIndex ).toBe( -1 );
			expect( item.type ).toBe( 'button' );
			expect( item.id ).toBe( 'mention-list-item-id:smiling face' );
			expect( item.childNodes ).toHaveLength( 1 );

			const { firstChild } = item;

			expect( firstChild.nodeName.toLowerCase() ).toBe( 'span' );
			expect( Array.from( firstChild.classList ) ).toEqual( [ 'ck', 'ck-button__label' ] );
			expect( firstChild.textContent ).toBe( '☺️ :smiling face:' );
		} );

		it( 'should render the "Show all emojis" item properly', () => {
			const item = itemRenderer( { id: ':__EMOJI_SHOW_ALL:' } );

			expect( item.nodeName.toLowerCase() ).toBe( 'button' );

			expect( Array.from( item.classList ) ).toEqual( [ 'ck', 'ck-button', 'ck-button_with-text' ] );
			expect( item.tabIndex ).toBe( -1 );
			expect( item.type ).toBe( 'button' );
			expect( item.id ).toBe( 'mention-list-item-id:__EMOJI_SHOW_ALL' );
			expect( item.childNodes ).toHaveLength( 1 );

			const { firstChild } = item;

			expect( firstChild.nodeName.toLowerCase() ).toBe( 'span' );
			expect( Array.from( firstChild.classList ) ).toEqual( [ 'ck', 'ck-button__label' ] );
			expect( firstChild.textContent ).toBe( 'Show all emoji...' );

			expect( locale.t ).toHaveBeenCalledTimes( 1 );
			expect( locale.t.mock.calls[ 0 ][ 0 ] ).toBe( 'Show all emoji...' );
		} );

		it( 'should render the "Keep on typing..." item properly', () => {
			const item = itemRenderer( { id: ':__EMOJI_HINT:' } );

			expect( item.nodeName.toLowerCase() ).toBe( 'button' );

			expect( Array.from( item.classList ) ).toEqual( [
				'ck',
				'ck-button',
				'ck-button_with-text',
				'ck-list-item-button',
				'ck-disabled'
			] );
			expect( item.tabIndex ).toBe( -1 );
			expect( item.type ).toBe( 'button' );
			expect( item.id ).toBe( 'mention-list-item-id:__EMOJI_HINT' );
			expect( item.childNodes ).toHaveLength( 1 );

			const { firstChild } = item;

			expect( firstChild.nodeName.toLowerCase() ).toBe( 'span' );
			expect( Array.from( firstChild.classList ) ).toEqual( [ 'ck', 'ck-button__label' ] );
			expect( firstChild.textContent ).toBe( 'Keep on typing to see the emoji.' );

			expect( locale.t ).toHaveBeenCalledTimes( 1 );
			expect( locale.t.mock.calls[ 0 ][ 0 ] ).toBe( 'Keep on typing to see the emoji.' );
		} );
	} );

	describe( '_overrideMentionExecuteListener()', () => {
		beforeEach( () => {
			const repository = editor.plugins.get( 'EmojiRepository' );
			vi.spyOn( repository, 'getEmojiByQuery' ).mockReturnValue( [
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

			mockEmojiRepositoryValues( editor );

			_setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

			expect( _getModelData( editor.model ) ).toBe( '<paragraph>Hello world! []</paragraph>' );

			editor.commands.execute( 'mention', {
				marker: '@',
				mention: { id: '@Barney' },
				text: 'Barney',
				range: editor.model.document.selection.getFirstRange()
			} );

			expect( _getModelData( editor.model ) ).toMatch(
				// eslint-disable-next-line @stylistic/max-len
				/<paragraph>Hello world! <\$text mention="{"uid":"[a-z0-9]+","_text":"Barney","id":"@Barney"}">Barney<\/\$text> \[\]<\/paragraph>/
			);

			await editor.destroy();
			editorElement.remove();
		} );

		it( 'must not override the default mention command execution if emoji repository is not ready', async () => {
			vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			fetchStub.mockRejectedValue( 'Failed to load CDN.' );

			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, EmojiPicker, Paragraph, Essentials, Mention ]
			} );

			_setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

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
				_setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

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

				expect( eventStop.called ).toBe( true );
			} );

			it( 'should stop the "mention" command when selecting the "Keep on typing..." option', () => {
				_setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

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

				expect( eventStop.called ).toBe( true );
			} );

			it( 'should stop the "mention" command when selecting the "Show all emoji" option', () => {
				_setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

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

				expect( eventStop.called ).toBe( true );

				expect( _getModelData( editor.model ) ).toBe( '<paragraph>Hello world! []</paragraph>' );
			} );
		} );

		it( 'should remove the auto-complete query when selecting an item from the list', () => {
			_setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

			expect( _getModelData( editor.model ) ).toBe( '<paragraph>Hello world! []</paragraph>' );

			const { startPosition, endPosition } = simulateTyping( ':raising' );

			const range = editor.model.change( writer => {
				return writer.createRange( startPosition, endPosition );
			} );

			editor.commands.execute( 'mention', {
				range,
				marker: ':',
				mention: { id: ':raising hands:', text: '🙌' }
			} );

			expect( _getModelData( editor.model ) ).toBe( '<paragraph>Hello world! 🙌[]</paragraph>' );
		} );

		it( 'should use the "insertText" command when inserting the emoji', () => {
			const spy = vi.fn();

			_setModelData( editor.model, '<paragraph>[]</paragraph>' );

			const { startPosition, endPosition } = simulateTyping( ':raising' );

			const range = editor.model.change( writer => {
				return writer.createRange( startPosition, endPosition );
			} );

			// Attach the listener right before picking up an item from the mention dropdown.
			// Otherwise, it counts the typed query, too.
			editor.commands.get( 'insertText' ).on( 'execute', spy );

			editor.commands.execute( 'mention', {
				range,
				marker: ':',
				mention: { id: ':raising hands:', text: '🙌' }
			} );

			expect( spy ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should remove the auto-complete query when selecting the "Show all emoji" option from the list', () => {
			_setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

			expect( _getModelData( editor.model ) ).toBe( '<paragraph>Hello world! []</paragraph>' );

			const { startPosition, endPosition } = simulateTyping( ':raising' );

			const range = editor.model.change( writer => {
				return writer.createRange( startPosition, endPosition );
			} );

			editor.commands.execute( 'mention', {
				range,
				marker: ':',
				mention: { id: ':__EMOJI_SHOW_ALL:' }
			} );

			expect( _getModelData( editor.model ) ).toBe( '<paragraph>Hello world! []</paragraph>' );
		} );

		it( 'should open the emoji picker UI when selecting the "Show all emojis" option from the list', () => {
			const emojiPicker = editor.plugins.get( 'EmojiPicker' );
			const stub = vi.spyOn( emojiPicker, 'showUI' );

			_setModelData( editor.model, '<paragraph>Hello world! []</paragraph>' );

			expect( _getModelData( editor.model ) ).toBe( '<paragraph>Hello world! []</paragraph>' );

			const { startPosition, endPosition } = simulateTyping( ':raising' );

			const range = editor.model.change( writer => {
				return writer.createRange( startPosition, endPosition );
			} );

			editor.commands.execute( 'mention', {
				range,
				marker: ':',
				mention: { id: ':__EMOJI_SHOW_ALL:' }

			} );

			expect( stub ).toHaveBeenCalledTimes( 1 );
			expect( stub.mock.calls[ 0 ][ 0 ] ).toBe( 'raising' );

			// Check the focus.
			expect( document.activeElement ).toBe( emojiPicker.emojiPickerView.searchView.inputView.queryView.fieldView.element );
		} );
	} );

	describe( '_queryEmojiCallbackFactory()', () => {
		let queryEmoji;

		beforeEach( () => {
			queryEmoji = editor.plugins.get( 'EmojiMention' )._queryEmojiCallbackFactory();
		} );

		it( 'should be a function', () => {
			expect( queryEmoji ).toBeInstanceOf( Function );
		} );

		it( 'should return an empty array when a query starts with a space', () => {
			const repository = editor.plugins.get( 'EmojiRepository' );
			vi.spyOn( repository, 'getEmojiByQuery' ).mockReturnValue( [] );

			expect( queryEmoji( ' ' ) ).toEqual( [] );
			expect( queryEmoji( '  ' ) ).toEqual( [] );
			expect( queryEmoji( ' see' ) ).toEqual( [] );
		} );

		it( 'should return an empty array when a query starts with a marker character', () => {
			const repository = editor.plugins.get( 'EmojiRepository' );
			vi.spyOn( repository, 'getEmojiByQuery' ).mockReturnValue( [] );

			expect( queryEmoji( ':' ) ).toEqual( [] );
			expect( queryEmoji( '::' ) ).toEqual( [] );
		} );

		it( 'should return an empty array when the repository plugin is not available', async () => {
			vi.spyOn( console, 'warn' ).mockImplementation( () => {} );
			fetchStub.mockRejectedValue( 'Failed to load CDN.' );

			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, Paragraph, Essentials, Mention ]
			} );

			editor.plugins.get( 'EmojiMention' )._isEmojiRepositoryAvailable = false;

			const queryEmoji = editor.plugins.get( 'EmojiMention' )._queryEmojiCallbackFactory();

			expect( queryEmoji( '' ) ).toEqual( [] );
			expect( queryEmoji( 'see' ) ).toEqual( [] );

			await editor.destroy();
			editorElement.remove();
		} );

		it( 'should return a hint item when a query is too short', () => {
			const repository = editor.plugins.get( 'EmojiRepository' );
			vi.spyOn( repository, 'getEmojiByQuery' ).mockReturnValue( [] );

			let queryResult = queryEmoji( '' );

			expect( queryResult ).toEqual( [
				{ id: ':__EMOJI_HINT:' }
			] );

			queryResult = queryEmoji( 's' );

			expect( queryResult ).toEqual( [
				{ id: ':__EMOJI_HINT:' }
			] );
		} );

		it( 'should pass the specified query to the repository plugin', () => {
			const repository = editor.plugins.get( 'EmojiRepository' );
			const getEmojiByQuery = vi.spyOn( repository, 'getEmojiByQuery' ).mockReturnValue( [] );

			queryEmoji( 'see no evil' );

			expect( getEmojiByQuery ).toHaveBeenCalledTimes( 1 );
			expect( getEmojiByQuery.mock.calls[ 0 ][ 0 ] ).toBe( 'see no evil' );
		} );

		it( 'should return an array of items that implements the `MentionFeedObjectItem` type', () => {
			const repository = editor.plugins.get( 'EmojiRepository' );
			vi.spyOn( repository, 'getEmojiByQuery' ).mockReturnValue( [
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

			expect( queryResult[ 0 ] ).toEqual( { text: '👍️', id: ':thumbs up:' } );
			expect( queryResult[ 1 ] ).toEqual( { text: '👎️', id: ':thumbs down:' } );
		} );

		it( 'should include a "Show all emoji" option when the "EmojiPicker" plugin is available', () => {
			const repository = editor.plugins.get( 'EmojiRepository' );
			vi.spyOn( repository, 'getEmojiByQuery' ).mockReturnValue( [] );

			const queryResult = queryEmoji( 'thumbs' );

			expect( queryResult ).toEqual( [
				{ id: ':__EMOJI_SHOW_ALL:' }
			] );
			expect( editor.plugins.has( 'EmojiPicker' ) ).toBe( true );
		} );

		it( 'should not include the show all emoji button when "EmojiPicker" plugin is not available', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, Mention ]
			} );

			mockEmojiRepositoryValues( editor );

			const repository = editor.plugins.get( 'EmojiRepository' );

			vi.spyOn( repository, 'getEmojiByQuery' ).mockReturnValue( [
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

			expect( queryResult ).toEqual( [
				{ text: '👍️', id: ':thumbs up:' },
				{ text: '👎️', id: ':thumbs down:' }
			] );
			expect( editor.plugins.has( 'EmojiPicker' ) ).toBe( false );

			await editor.destroy();
			editorElement.remove();
		} );

		it( 'should return emojis with the proper skin tone when it is selected in the emoji picker plugin', () => {
			const repository = editor.plugins.get( 'EmojiRepository' );
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

			vi.spyOn( repository, 'getEmojiByQuery' ).mockReturnValue( [ thumbUpItem ] );

			editor.plugins.get( EmojiPicker ).showUI();
			editor.plugins.get( EmojiPicker )._hideUI();
			editor.plugins.get( EmojiPicker ).emojiPickerView.gridView.skinTone = 'dark';

			const queryResult = queryEmoji( 'thumbs' );

			expect( queryResult.length ).toBe( 2 );

			expect( queryResult[ 0 ] ).toEqual( {
				id: ':thumbs up:',
				text: thumbUpItem.skins.dark
			} );
		} );

		it( 'should return emojis with the default skin tone when the skin tone is selected but the emoji does not have variants', () => {
			const repository = editor.plugins.get( 'EmojiRepository' );
			const thumbUpItem = {
				annotation: 'thumbs up',
				emoji: '👍️',
				skins: {
					'default': '👍️'
				}
			};
			vi.spyOn( repository, 'getEmojiByQuery' ).mockReturnValue( [ thumbUpItem ] );

			editor.plugins.get( EmojiPicker ).showUI();
			editor.plugins.get( EmojiPicker )._hideUI();
			editor.plugins.get( EmojiPicker ).emojiPickerView.gridView.skinTone = 'dark';

			const queryResult = queryEmoji( 'thumbs' );

			expect( queryResult.length ).toBe( 2 );

			expect( queryResult[ 0 ] ).toEqual( {
				id: ':thumbs up:',
				text: thumbUpItem.skins.default
			} );
		} );

		it( 'should read default skin tone from config', async () => {
			const editorElement = document.createElement( 'div' );
			document.body.appendChild( editorElement );

			const editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, EmojiPicker, Paragraph, Essentials, Mention ],
				emoji: {
					skinTone: 'medium'
				}
			} );

			mockEmojiRepositoryValues( editor );

			const repository = editor.plugins.get( 'EmojiRepository' );
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

			vi.spyOn( repository, 'getEmojiByQuery' ).mockReturnValue( [ thumbUpItem ] );

			const queryEmoji = editor.plugins.get( 'EmojiMention' )._queryEmojiCallbackFactory();
			const queryResult = queryEmoji( 'thumbs' );

			expect( queryResult.length ).toBe( 2 );

			expect( queryResult[ 0 ] ).toEqual( {
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
				emoji: {
					skinTone: 'medium'
				}
			} );

			mockEmojiRepositoryValues( editor );

			const repository = editor.plugins.get( 'EmojiRepository' );
			const thumbUpItem = {
				annotation: 'thumbs up',
				emoji: '👍️',
				skins: {
					'default': '👍️'
				}
			};

			vi.spyOn( repository, 'getEmojiByQuery' ).mockReturnValue( [ thumbUpItem ] );

			const queryEmoji = editor.plugins.get( 'EmojiMention' )._queryEmojiCallbackFactory();
			const queryResult = queryEmoji( 'thumbs' );

			expect( queryResult.length ).toBe( 2 );

			expect( queryResult[ 0 ] ).toEqual( {
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
