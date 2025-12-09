/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClassicTestEditor } from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { ImageCaption } from '../src/imagecaption.js';
import { ImageCaptionEditing } from '../src/imagecaption/imagecaptionediting.js';
import { ImageCaptionUI } from '../src/imagecaption/imagecaptionui.js';

describe( 'ImageCaption', () => {
	let editor, editorElement;

	beforeEach( () => {
		editorElement = window.document.createElement( 'div' );
		window.document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ ImageCaption ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();
		return editor.destroy();
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( ImageCaption.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageCaption.isPremiumPlugin ).toBe( false );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ImageCaption ) ).toBeInstanceOf( ImageCaption );
	} );

	it( 'should load the ImageCaptionEditing plugin', () => {
		expect( editor.plugins.get( ImageCaptionEditing ) ).toBeInstanceOf( ImageCaptionEditing );
	} );

	it( 'should load the ImageCaptionUI plugin', () => {
		expect( editor.plugins.get( ImageCaptionUI ) ).toBeInstanceOf( ImageCaptionUI );
	} );
} );
