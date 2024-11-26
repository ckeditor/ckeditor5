/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console */

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Mention } from '@ckeditor/ckeditor5-mention';
import Emoji from '../src/emoji.js';
import EmojiLibraryIntegration from '../src/emojilibraryintegration.js';
import EmojiMentionIntegration from '../src/emojimentionintegration.js';
import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

describe( 'EmojiMentionIntegration', () => {
	let editor, editorElement, consoleLogStub, consoleWarnStub;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		consoleLogStub = sinon.stub( console, 'log' );
		consoleWarnStub = sinon.stub( console, 'warn' );

		editor = await ClassicEditor.create( editorElement, {
			plugins: [
				Emoji,
				Paragraph,
				Essentials,
				Mention
			]
		} );
	} );

	afterEach( async () => {
		consoleLogStub.restore();
		consoleWarnStub.restore();

		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( EmojiMentionIntegration.pluginName ).to.equal( 'EmojiMentionIntegration' );
	} );

	it( 'should have proper "requires" value', () => {
		expect( EmojiMentionIntegration.requires ).to.deep.equal( [
			EmojiLibraryIntegration
		] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmojiMentionIntegration.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmojiMentionIntegration.isPremiumPlugin ).to.be.false;
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

		editor = await ClassicEditor.create( editorElement, {
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

		editor = await ClassicEditor.create( editorElement, {
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
			expect( item.textContent ).to.equal( 'Show all emoji...' );
			expect( item.style.width ).to.equal( '100%' );
			expect( item.style.display ).to.equal( 'block' );
		} );
	} );

	describe( '_overrideMentionExecuteListener()', () => {
		it( 'does not override the regular mention command execution', async () => {
			await editor.destroy();

			editor = await ClassicEditor.create( editorElement, {
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
			setModelData( editor.model, '<paragraph>Hello world![]</paragraph>' );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>Hello world![]</paragraph>' );

			const range = editor.model.document.selection.getFirstRange();
			editor.commands.execute( 'mention', { range, mention: { id: 'emoji:__SHOW_ALL_EMOJI__:' } } );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>Hello world![]</paragraph>' );

			expect( consoleLogStub.firstCall.args[ 0 ] ).to.equal( 'SHOWING EMOJI WINDOW' );
		} );
	} );
} );