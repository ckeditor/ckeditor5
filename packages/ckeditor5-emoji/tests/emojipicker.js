/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document setTimeout Event KeyboardEvent */

import { ContextualBalloon } from 'ckeditor5/src/ui.js';
import { EmojiPicker } from '../src/index.js';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

describe( 'EmojiPicker', () => {
	let editor, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicEditor.create( editorElement, {
			plugins: [ EmojiPicker, Essentials, Paragraph ],
			toolbar: [ 'emoji' ],
			menuBar: {
				isVisible: true
			}
		} );
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should be correctly named', () => {
		expect( EmojiPicker.pluginName ).to.equal( 'EmojiPicker' );
	} );

	it( 'should have proper "requires" value', () => {
		expect( EmojiPicker.requires ).to.deep.equal( [
			ContextualBalloon
		] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmojiPicker.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmojiPicker.isPremiumPlugin ).to.be.false;
	} );

	it( 'should open the picker when clicking the toolbar button', async () => {
		const emojiToolbarButton = document.querySelector( 'button[data-cke-tooltip-text="Emoji"]' );

		emojiToolbarButton.click();

		// Wait for the emojis to load.
		await new Promise( resolve => setTimeout( resolve, 500 ) );

		const emojiSmileButton = document.querySelector( 'emoji-picker' ).shadowRoot.querySelector( 'button[title="grinning face"]' );

		expect( emojiSmileButton.checkVisibility() ).to.equal( true );
	} );

	it( 'should open the picker when clicking the menu bar button', async () => {
		const insertMenuBarButton = Array.from( document.querySelectorAll( '.ck-menu-bar__menu__button' ) )
			.find( button => button.innerText === 'Insert' );

		insertMenuBarButton.click();

		const emojiMenuBarButton = Array.from( document.querySelectorAll( '.ck-menu-bar__menu__item__button' ) )
			.find( button => button.innerText === 'Emoji' );

		emojiMenuBarButton.click();

		// Wait for the emojis to load.
		await new Promise( resolve => setTimeout( resolve, 500 ) );

		const emojiSmileButton = document.querySelector( 'emoji-picker' ).shadowRoot.querySelector( 'button[title="grinning face"]' );

		expect( emojiSmileButton.checkVisibility() ).to.equal( true );
	} );

	it( 'should insert an emoji after clicking on it in the picker', async () => {
		expect( getModelData( editor.model ) ).to.equal( '<paragraph>[]</paragraph>' );

		const emojiToolbarButton = document.querySelector( 'button[data-cke-tooltip-text="Emoji"]' );

		emojiToolbarButton.click();

		// Wait for the emojis to load.
		await new Promise( resolve => setTimeout( resolve, 500 ) );

		const emojiSmileButton = document.querySelector( 'emoji-picker' ).shadowRoot.querySelector( 'button[title="grinning face"]' );

		emojiSmileButton.click();

		// Wait for the picker to act.
		await new Promise( resolve => setTimeout( resolve, 250 ) );

		expect( getModelData( editor.model ) ).to.equal( '<paragraph>😀[]</paragraph>' );
	} );

	it( 'should close the picker when clicking outside of it', async () => {
		expect( getModelData( editor.model ) ).to.equal( '<paragraph>[]</paragraph>' );

		const emojiToolbarButton = document.querySelector( 'button[data-cke-tooltip-text="Emoji"]' );

		emojiToolbarButton.click();

		// Wait for the emojis to load.
		await new Promise( resolve => setTimeout( resolve, 250 ) );

		const emojiSmileButton = document.querySelector( 'emoji-picker' ).shadowRoot.querySelector( 'button[title="grinning face"]' );
		expect( emojiSmileButton.checkVisibility() ).to.equal( true );

		document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

		expect( emojiSmileButton.checkVisibility() ).to.equal( false );
	} );

	it( 'should close the picker when escape is clicked', async () => {
		expect( getModelData( editor.model ) ).to.equal( '<paragraph>[]</paragraph>' );

		const emojiToolbarButton = document.querySelector( 'button[data-cke-tooltip-text="Emoji"]' );

		emojiToolbarButton.click();

		// Wait for the emojis to load.
		await new Promise( resolve => setTimeout( resolve, 250 ) );

		const emojiSearchBar = document.querySelector( 'emoji-picker' ).shadowRoot.querySelector( 'input#search' );
		expect( emojiSearchBar.checkVisibility() ).to.equal( true );

		emojiSearchBar.dispatchEvent( new KeyboardEvent( 'keydown', { bubbles: true, composed: true, key: 'Escape' } ) );

		expect( emojiSearchBar.checkVisibility() ).to.equal( false );
	} );
} );
