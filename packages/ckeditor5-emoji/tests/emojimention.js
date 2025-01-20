/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document, console, setTimeout */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Emoji, EmojiMention, EmojiPicker } from '../src/index.js';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { Mention } from '@ckeditor/ckeditor5-mention';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import EmojiDatabase from '../src/emojidatabase.js';

class EmojiDatabaseMock extends EmojiDatabase {
	// init() {
	// 	console.error( 'running init!' );
	// }

	// getEmojiBySearchQuery( query ) {
	// 	return [
	// 		[
	// 			{
	// 				"shortcodes": [
	// 					"toothbrush"
	// 				],
	// 				"annotation": "toothbrush",
	// 				"tags": [
	// 					"bathroom",
	// 					"brush",
	// 					"clean",
	// 					"dental",
	// 					"hygiene",
	// 					"teeth",
	// 					"toiletry"
	// 				],
	// 				"emoji": "🪥",
	// 				"order": 4447,
	// 				"group": 7,
	// 				"version": 13,
	// 				"skins": {
	// 					"default": "🪥"
	// 				}
	// 			}
	// 		]
	// 	]
	// }
}

describe.only( 'EmojiMention', () => {
	testUtils.createSinonSandbox();

	let editor, editorElement, consoleLogStub, consoleWarnStub;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		consoleLogStub = sinon.stub( console, 'log' );
		consoleWarnStub = sinon.stub( console, 'warn' );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Emoji,
				EmojiPicker,
				Mention,
				Essentials,
				Paragraph
			],
			substitutePlugins: [ EmojiDatabaseMock ]
		} );
	} );

	afterEach( async () => {
		consoleLogStub.restore();
		consoleWarnStub.restore();

		editorElement.remove();

		await editor.destroy();
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

	it( 'should pass correct config for mention plugin', () => {
		const configs = editor.config.get( 'mention.feeds' );

		expect( configs.length ).to.equal( 1 );

		const config = configs[ 0 ];

		expect( config.marker ).to.equal( ':' );
		expect( config.dropdownLimit ).to.equal( 6 );
		expect( config.itemRenderer ).to.be.instanceOf( Function );
		expect( config.feed ).to.be.instanceOf( Function );
	} );

	it( 'should pass correct config for mention plugin when there is another, non-conflicting mention feed config', async () => {
		await editor.destroy();

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Emoji,
				Paragraph,
				Essentials,
				Mention
			],
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
	} );

	it( 'should not pass config for mention plugin when there is another conflicting mention feed config', async () => {
		await editor.destroy();

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Emoji,
				Paragraph,
				Essentials,
				Mention
			],
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
	} );

	it( 'should not pass config for mention plugin when there is another conflicting merge fields config', async () => {
		await editor.destroy();

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [
				Emoji,
				Paragraph,
				Essentials,
				Mention
			],
			mergeFields: {
				prefix: ':'
			}
		} );

		const configs = editor.config.get( 'mention.feeds' );

		expect( configs.length ).to.equal( 0 );
	} );

	describe( '_customItemRenderer()', () => {
		let itemRenderer;

		beforeEach( () => {
			itemRenderer = editor.config.get( 'mention.feeds' )[ 0 ].itemRenderer;
		} );

		it( 'should be a function', () => {
			expect( itemRenderer ).to.be.instanceOf( Function );
		} );

		it( 'should render the MentionFeedObjectItem properly', () => {
			const item = itemRenderer( { id: 'emoji:smile:', text: ':)' } );

			expect( item.nodeName ).to.equal( 'SPAN' );
			expect( Array.from( item.classList ) ).to.deep.equal( [ 'custom-item' ] );
			expect( item.id ).to.equal( 'mention-list-item-id-emoji:smile:' );
			expect( item.textContent ).to.equal( ':) :smile:' );
			expect( item.style.width ).to.equal( '100%' );
			expect( item.style.display ).to.equal( 'block' );
		} );

		it( 'should render the show all emoji item properly', () => {
			const item = itemRenderer( { id: 'emoji:__SHOW_ALL_EMOJI__:' } );

			expect( item.nodeName ).to.equal( 'SPAN' );
			expect( Array.from( item.classList ) ).to.deep.equal( [ 'custom-item' ] );
			expect( item.id ).to.equal( 'mention-list-item-id-emoji:__SHOW_ALL_EMOJI__:' );
			expect( item.textContent ).to.equal( 'Show all emojis...' );
			expect( item.style.width ).to.equal( '100%' );
			expect( item.style.display ).to.equal( 'block' );
		} );
	} );

	describe( '_overrideMentionExecuteListener()', () => {
		it( 'does not override the regular mention command execution', async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [
					Emoji,
					Paragraph,
					Essentials,
					Mention
				],
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
		} );

		it( 'overrides the mention command execution when inserting an emoji', () => {
			setModelData( editor.model, '<paragraph>[Hello world!]</paragraph>' );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>[Hello world!]</paragraph>' );

			const range = editor.model.document.selection.getFirstRange();
			editor.commands.execute( 'mention', { range, mention: { id: 'emoji:foo:', text: 'bar' } } );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>bar[]</paragraph>' );
		} );

		it( 'overrides the mention command execution when triggering no results button', () => {
			setModelData( editor.model, '<paragraph>Hello world![]</paragraph>' );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>Hello world![]</paragraph>' );

			const range = editor.model.document.selection.getFirstRange();
			editor.commands.execute( 'mention', { range, mention: { id: 'emoji:__NO_RESULTS__:' } } );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>Hello world![]</paragraph>' );
		} );

		it( 'overrides the mention command execution when triggering show all emoji button', () => {
			// TODO split this test
			setModelData( editor.model, '<paragraph>Hello world![]</paragraph>' );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>Hello world![]</paragraph>' );

			const range = editor.model.document.selection.getFirstRange();
			editor.commands.execute( 'mention', { range, mention: { id: 'emoji:__SHOW_ALL_EMOJI__:', text: 'see no evil' } } );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>Hello world![]</paragraph>' );

			const emojiSearchBar = document.querySelector( '.ck-emoji-picker input' );
			expect( emojiSearchBar.value ).to.equal( 'see no evil' );
		} );

		it( 'should have the "Nothing found" message hidden after opening the picker when an emoji is found', async () => {
			setModelData( editor.model, '<paragraph>Hello world![]</paragraph>' );

			const range = editor.model.document.selection.getFirstRange();
			editor.commands.execute( 'mention', { range, mention: { id: 'emoji:__SHOW_ALL_EMOJI__:', text: 'see no evil' } } );

			// Wait for the emojis to load.
			await new Promise( resolve => setTimeout( resolve, 250 ) );

			expect(
				document.querySelector( '.ck.ck-search__info' ).classList.contains( 'ck-hidden' )
			).to.equal( true );
		} );

		it( 'should have the "Nothing found" message shown after opening the picker when no emoji is found', async () => {
			setModelData( editor.model, '<paragraph>Hello world![]</paragraph>' );

			const range = editor.model.document.selection.getFirstRange();
			editor.commands.execute( 'mention', { range, mention: { id: 'emoji:__SHOW_ALL_EMOJI__:', text: 'fooooooooooooooooooooooo' } } );

			// Wait for the emojis to load.
			await new Promise( resolve => setTimeout( resolve, 250 ) );

			expect(
				document.querySelector( '.ck.ck-search__info' ).classList.contains( 'ck-hidden' )
			).to.equal( false );
		} );
	} );

	describe( 'queryEmoji()', () => {
		let queryEmoji;

		beforeEach( () => {
			queryEmoji = editor.config.get( 'mention.feeds' )[ 0 ].feed;
		} );

		it( 'should be a function', () => {
			expect( queryEmoji ).to.be.instanceOf( Function );
		} );

		it( 'should return nothing when querying a single character', () => {
			const queryResult = queryEmoji( 'a' );

			expect( queryResult ).to.have.length( 1 );
			expect( queryResult[ 0 ].id ).to.equal( 'emoji:__SHOW_ALL_EMOJI__:' );
		} );

		it( 'should query single emoji properly properly', () => {
			const queryResult = queryEmoji( 'see no evil' );

			expect( queryResult ).to.deep.equal( [
				{ id: 'emoji:see-no-evil_monkey:', text: '🙈' },
				{ id: 'emoji:__SHOW_ALL_EMOJI__:', text: 'see no evil' }
			] );
		} );

		it( 'should query multiple emojis properly properly', () => {
			const queryResult = queryEmoji( 'face' );

			expect( queryResult.length ).to.equal( 6 );

			queryResult.forEach( item => {
				expect( item.id.startsWith( 'emoji:' ) ).to.be.true;

				if ( item.id !== 'emoji:__SHOW_ALL_EMOJI__:' ) {
					expect( typeof item.text ).to.equal( 'string' );
				}
			} );

			expect( queryResult.some( item => item.id === 'emoji:__SHOW_ALL_EMOJI__:' ) ).to.equal( true );
		} );

		it( 'should not include the show all emoji button when EmojiPicker plugin is not available', async () => {
			await editor.destroy();

			editor = await ClassicTestEditor.create( editorElement, {
				plugins: [ EmojiMention, Mention ]
			} );

			queryEmoji = editor.config.get( 'mention.feeds' )[ 0 ].feed;

			const queryResult = queryEmoji( 'face' );

			expect( queryResult.length ).to.equal( 6 );

			queryResult.forEach( item => {
				expect( item.id.startsWith( 'emoji:' ) ).to.be.true;
				expect( typeof item.text ).to.equal( 'string' );
			} );

			expect( queryResult.some( item => item.id === 'emoji:__SHOW_ALL_EMOJI__:' ) ).to.equal( false );
		} );

		it( 'should return emojis with the proper skin tone when it is selected in the emoji picker plugin', () => {
			editor.plugins.get( EmojiPicker ).showUI();
			editor.plugins.get( EmojiPicker )._hideUI();
			editor.plugins.get( EmojiPicker )._emojiPickerView.gridView.skinTone = 'dark';

			const queryResult = queryEmoji( 'hand_with_index_finger_and_thumb_crossed' );

			expect( queryResult.length ).to.equal( 2 );

			expect( queryResult[ 0 ] ).to.deep.equal( {
				id: 'emoji:hand_with_index_finger_and_thumb_crossed:',
				text: '🫰🏿'
			} );
			expect( queryResult[ 1 ].id ).to.equal( 'emoji:__SHOW_ALL_EMOJI__:' );
		} );

		it( 'should return emojis with the default skin tone when the skin tone is selected but the emoji does not have variants', () => {
			editor.plugins.get( EmojiPicker )._selectedSkinTone = 5;

			const queryResult = queryEmoji( 'see no evil' );

			expect( queryResult.length ).to.equal( 2 );

			expect( queryResult[ 0 ] ).to.deep.equal( {
				id: 'emoji:see-no-evil_monkey:',
				text: '🙈'
			} );
			expect( queryResult[ 1 ].id ).to.equal( 'emoji:__SHOW_ALL_EMOJI__:' );
		} );
	} );
} );
