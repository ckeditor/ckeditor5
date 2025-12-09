/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Clipboard } from '@ckeditor/ckeditor5-clipboard';
import { Image } from '../src/image.js';
import { ImageUpload } from '../src/imageupload.js';
import { ImageUploadEditing } from '../src/imageupload/imageuploadediting.js';
import { ImageUploadProgress } from '../src/imageupload/imageuploadprogress.js';
import { ImageUploadUI } from '../src/imageupload/imageuploadui.js';

import { UploadAdapterPluginMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';

describe( 'ImageUpload', () => {
	let editor, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Image, ImageUpload, UploadAdapterPluginMock, Clipboard ]
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
		expect( ImageUpload.isOfficialPlugin ).toBe( true );
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ImageUpload.isPremiumPlugin ).toBe( false );
	} );

	it( 'should include ImageUploadEditing', () => {
		expect( editor.plugins.get( ImageUploadEditing ) ).toBeInstanceOf( ImageUploadEditing );
	} );

	it( 'should include ImageUploadProgress', () => {
		expect( editor.plugins.get( ImageUploadProgress ) ).toBeInstanceOf( ImageUploadProgress );
	} );

	it( 'should include ImageUploadUI', () => {
		expect( editor.plugins.get( ImageUploadUI ) ).toBeInstanceOf( ImageUploadUI );
	} );
} );
