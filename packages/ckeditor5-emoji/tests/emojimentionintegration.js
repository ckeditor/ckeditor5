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
	let editor, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicEditor.create( editorElement, {
			plugins: [
				Emoji,
				Paragraph,
				Essentials,
				Mention
			],
			emoji: {
				dropdownLimit: 10
			}
		} );
	} );

	afterEach( async () => {
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
		expect( config.minimumCharacters ).to.equal( 1 );
		expect( config.dropdownLimit ).to.equal( 10 );
		expect( config.itemRenderer ).to.be.instanceOf( Function );
		expect( config.feed ).to.be.instanceOf( Function );
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
			expect( item.textContent ).to.equal( 'See more...' );
			expect( item.style.width ).to.equal( '100%' );
			expect( item.style.display ).to.equal( 'block' );
		} );
	} );

	describe( '_overrideMentionExecuteListener()', () => {
		it( 'overrides the mention command execution when inserting an emoji', () => {
			setModelData( editor.model, '<paragraph>[Hello world!]</paragraph>' );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>[Hello world!]</paragraph>' );

			const range = editor.model.document.selection.getFirstRange();
			editor.commands.execute( 'mention', { range, mention: { id: 'emoji:foo:', text: 'bar' } } );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>bar[]</paragraph>' );
		} );

		it( 'overrides the mention command execution when triggering show all emoji button', () => {
			const consoleStub = sinon.stub( console, 'log' );

			setModelData( editor.model, '<paragraph>[Hello world!]</paragraph>' );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>[Hello world!]</paragraph>' );

			const range = editor.model.document.selection.getFirstRange();
			editor.commands.execute( 'mention', { range, mention: { id: 'emoji:__SHOW_ALL_EMOJI__:' } } );

			expect( getModelData( editor.model ) ).to.equal( '<paragraph>[Hello world!]</paragraph>' );

			expect( consoleStub.firstCall.args[ 0 ] ).to.equal( 'SHOWING EMOJI WINDOW' );
		} );
	} );
} );
