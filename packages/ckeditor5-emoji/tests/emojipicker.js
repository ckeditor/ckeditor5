/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* global document setTimeout Event KeyboardEvent */

import { ContextualBalloon, Dialog } from 'ckeditor5/src/ui.js';
import { EmojiPicker } from '../src/index.js';
import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import { Typing } from '@ckeditor/ckeditor5-typing';

describe( 'EmojiPicker', () => {
	let editor, editorElement, emojiPicker;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		await ClassicEditor
			.create( editorElement, {
				plugins: [ EmojiPicker, Essentials, Paragraph ],
				toolbar: [ 'emoji' ],
				menuBar: {
					isVisible: true
				}
			} )
			.then( newEditor => {
				editor = newEditor;
				emojiPicker = newEditor.plugins.get( EmojiPicker );
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
			ContextualBalloon, Typing, Dialog
		] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( EmojiPicker.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( EmojiPicker.isPremiumPlugin ).to.be.false;
	} );

	it( 'should open the picker when clicking the toolbar button', async () => {
		clickEmojiToolbarButton();

		const emojiGrid = document.querySelector( '.ck-emoji-grid__tiles' );

		expect( emojiGrid.checkVisibility() ).to.equal( true );
	} );

	it( 'should open the picker when clicking the menu bar button', async () => {
		const insertMenuBarButton = Array.from( document.querySelectorAll( '.ck-menu-bar__menu__button' ) )
			.find( button => button.innerText === 'Insert' );

		insertMenuBarButton.click();

		const emojiMenuBarButton = Array.from( document.querySelectorAll( '.ck-menu-bar__menu__item__button' ) )
			.find( button => button.innerText === 'Emoji' );

		emojiMenuBarButton.click();

		const emojiGrid = document.querySelector( '.ck-emoji-grid__tiles' );

		expect( emojiGrid.checkVisibility() ).to.equal( true );
	} );

	it( 'should insert an emoji after clicking on it in the picker', async () => {
		expect( getModelData( editor.model ) ).to.equal( '<paragraph>[]</paragraph>' );

		clickEmojiToolbarButton();

		const firstEmojiInGrid = document.querySelector( '.ck-emoji-grid__tiles > button' );

		firstEmojiInGrid.click();

		expect( getModelData( editor.model ) ).to.equal( '<paragraph>😀[]</paragraph>' );
	} );

	it( 'should close the picker when clicking outside of it', async () => {
		clickEmojiToolbarButton();

		const firstEmojiInGrid = document.querySelector( '.ck-emoji-grid__tiles > button' );
		expect( firstEmojiInGrid.checkVisibility() ).to.equal( true );

		document.body.dispatchEvent( new Event( 'mousedown', { bubbles: true } ) );

		expect( firstEmojiInGrid.checkVisibility() ).to.equal( false );
	} );

	it( 'should close the picker when focus is on the picker and escape is clicked', async () => {
		clickEmojiToolbarButton();

		const emojiSearchBar = document.querySelector( '.ck-emoji-input input' );
		expect( emojiSearchBar.checkVisibility() ).to.equal( true );

		emojiSearchBar.dispatchEvent( new KeyboardEvent( 'keydown', { bubbles: true, composed: true, key: 'Escape' } ) );

		expect( emojiSearchBar.checkVisibility() ).to.equal( false );
	} );

	it( 'should update the grid when search query changes', async () => {
		clickEmojiToolbarButton();

		const originalFirstEmojiInGridTitle = document.querySelector( '.ck-emoji-grid__tiles > button' ).title;

		const emojiSearchBar = document.querySelector( '.ck-emoji-input input' );
		emojiSearchBar.value = 'frown';
		emojiSearchBar.dispatchEvent( new Event( 'input' ) );

		// Wait for the emojis to load.
		await new Promise( resolve => setTimeout( resolve, 250 ) );

		const newFirstEmojiInGridTitle = document.querySelector( '.ck-emoji-grid__tiles > button' ).title;

		expect( originalFirstEmojiInGridTitle ).to.not.equal( newFirstEmojiInGridTitle );
	} );

	it( 'should update the grid when category changes', async () => {
		clickEmojiToolbarButton();

		const originalFirstEmojiInGridTitle = document.querySelector( '.ck-emoji-grid__tiles > button' ).title;

		const secondCategoryButton = document.querySelectorAll( '.ck-emoji-categories > button' )[ 1 ];
		secondCategoryButton.click();

		// Wait for the emojis to load.
		await new Promise( resolve => setTimeout( resolve, 250 ) );

		const newFirstEmojiInGridTitle = document.querySelector( '.ck-emoji-grid__tiles > button' ).title;

		expect( originalFirstEmojiInGridTitle ).to.not.equal( newFirstEmojiInGridTitle );
	} );

	it( 'should update the grid when skin tone changes', async () => {
		clickEmojiToolbarButton();

		const secondCategoryButton = document.querySelectorAll( '.ck-emoji-categories > button' )[ 1 ];
		secondCategoryButton.click();

		// Wait for the emojis to load.
		await new Promise( resolve => setTimeout( resolve, 250 ) );

		const originalFirstEmojiInGrid = document.querySelector( '.ck-emoji-grid__tiles > button' );
		const originalFirstEmojiInGridTitle = originalFirstEmojiInGrid.title;
		const originalFirstEmojiInGridText = originalFirstEmojiInGrid.innerText;

		const skinToneDropdown = document.querySelector( '.ck-emoji-tone button' );
		skinToneDropdown.click();

		const lastSkinToneButton = Array.from( document.querySelectorAll( '.ck-emoji-tone .ck-dropdown__panel button' ) ).at( -1 );
		lastSkinToneButton.click();

		// Wait for the emojis to load.
		await new Promise( resolve => setTimeout( resolve, 250 ) );

		const newFirstEmojiInGrid = document.querySelector( '.ck-emoji-grid__tiles > button' );
		const newFirstEmojiInGridTitle = newFirstEmojiInGrid.title;
		const newFirstEmojiInGridText = newFirstEmojiInGrid.innerText;

		// Title stays the same as the emojis are the same.
		expect( originalFirstEmojiInGridTitle ).to.equal( newFirstEmojiInGridTitle );
		// Inner text changes as the emojis are different skin tone variants.
		expect( originalFirstEmojiInGridText ).to.not.equal( newFirstEmojiInGridText );
	} );

	it( 'should show emoji info on the bottom panel when an emoji in the grid is hovered', async () => {
		clickEmojiToolbarButton();

		const spy = sinon.spy( emojiPicker._emojiPickerView.infoView, 'set' );

		sinon.assert.notCalled( spy );

		emojiPicker._emojiPickerView.gridView.fire( 'tileHover' );

		sinon.assert.calledOnce( spy );
	} );

	it( 'should show emoji info on the bottom panel when an emoji in the grid is focused', async () => {
		clickEmojiToolbarButton();

		const spy = sinon.spy( emojiPicker._emojiPickerView.infoView, 'set' );

		sinon.assert.notCalled( spy );

		emojiPicker._emojiPickerView.gridView.fire( 'tileFocus' );

		sinon.assert.calledOnce( spy );
	} );
} );

function clickEmojiToolbarButton() {
	const emojiToolbarButton = document.querySelector( 'button[data-cke-tooltip-text="Emoji"]' );

	emojiToolbarButton.click();
}
