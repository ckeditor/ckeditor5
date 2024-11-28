/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document setTimeout */

import { ContextualBalloon } from 'ckeditor5/src/ui.js';
import { EmojiPicker } from '../src/index.js';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';

describe( 'EmojiPicker', () => {
	let editor, editorElement;

	beforeEach( async () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		editor = await ClassicEditor.create( editorElement, {
			plugins: [ EmojiPicker, Paragraph ],
			toolbar: [ 'emoji' ]
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

	it( 'should insert an emoji after clicking on it in the picker', async () => {
		expect( getModelData( editor.model ) ).to.equal( '<paragraph>[]</paragraph>' );

		const emojiToolbarButton = Array.from( document.querySelectorAll( 'button' ) ).find( button => button.innerText === 'Emoji' );

		emojiToolbarButton.click();

		// Wait for the emojis to load.
		await new Promise( resolve => setTimeout( resolve, 500 ) );

		const emojiSmileButton = document.querySelector( 'emoji-picker' ).shadowRoot.querySelector( 'button[title="grinning face"]' );

		emojiSmileButton.click();

		// Wait for the picker to act.
		await new Promise( resolve => setTimeout( resolve, 500 ) );

		expect( getModelData( editor.model ) ).to.equal( '<paragraph>[]😀</paragraph>' );
	} );
} );
