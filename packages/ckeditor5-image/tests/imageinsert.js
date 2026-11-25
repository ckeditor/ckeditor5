/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { Image } from '../src/image.js';
import { ImageInsert } from '../src/imageinsert.js';
import { ImageUpload } from '../src/imageupload.js';
import { ImageInsertUI } from '../src/imageinsert/imageinsertui.js';
import { ImageInsertViaUrl } from '../src/imageinsertviaurl.js';

import { global, keyCodes } from '@ckeditor/ckeditor5-utils';

describe( 'ImageInsert', () => {
	let editorElement, editor;

	beforeEach( async () => {
		editorElement = global.document.createElement( 'div' );
		global.document.body.appendChild( editorElement );

		editor = await ClassicTestEditor.create( editorElement, {
			plugins: [ Image, ImageInsert ]
		} );
	} );

	afterEach( async () => {
		editorElement.remove();

		await editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( 'ImageInsert' ) ).toBeInstanceOf( ImageInsert );
	} );

	it( 'should load ImageInsertUI plugin', () => {
		expect( editor.plugins.get( 'ImageInsertUI' ) ).toBeInstanceOf( ImageInsertUI );
	} );

	it( 'should load ImageUpload plugin', () => {
		expect( editor.plugins.get( 'ImageUpload' ) ).toBeInstanceOf( ImageUpload );
	} );

	it( 'should load ImageInsertViaUrl plugin', () => {
		expect( editor.plugins.get( 'ImageInsertViaUrl' ) ).toBeInstanceOf( ImageInsertViaUrl );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageInsert.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageInsert.isPremiumPlugin ).toBe( false );
	} );

	describe( 'insert image dropdown keyboard navigation', () => {
		let dropdown, formView;

		beforeEach( () => {
			dropdown = editor.ui.componentFactory.create( 'insertImage' );
			dropdown.render();
			global.document.body.appendChild( dropdown.element );

			dropdown.isOpen = true;
			formView = dropdown.panelView.children.get( 0 );
		} );

		afterEach( () => {
			dropdown.element.remove();
			dropdown.destroy();
		} );

		it( 'should navigate the built-in integrations using the arrow keys', () => {
			const uploadButtonView = formView.children.get( 0 );
			const urlButtonView = formView.children.get( 1 );

			formView.focus();
			expect( formView.focusTracker.focusedElement ).toBe( uploadButtonView.element );

			pressKey( formView.focusTracker.focusedElement, keyCodes.arrowdown );
			expect( formView.focusTracker.focusedElement ).toBe( urlButtonView.element );

			pressKey( formView.focusTracker.focusedElement, keyCodes.arrowup );
			expect( formView.focusTracker.focusedElement ).toBe( uploadButtonView.element );
		} );

		it( 'should close the dropdown using the arrow left key', () => {
			formView.focus();

			pressKey( formView.focusTracker.focusedElement, keyCodes.arrowleft );
			expect( dropdown.isOpen ).toBe( false );
		} );

		function pressKey( element, keyCode ) {
			element.dispatchEvent( new KeyboardEvent( 'keydown', { keyCode, bubbles: true, cancelable: true } ) );
		}
	} );
} );
