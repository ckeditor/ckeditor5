/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '../src/imageupload';
import ImageUploadEditing from '../src/imageupload/imageuploadediting';
import ImageUploadProgress from '../src/imageupload/imageuploadprogress';
import ImageUploadUI from '../src/imageupload/imageuploadui';

import { UploadAdapterPluginMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks';

describe( 'ImageUpload', () => {
	let editor, editorElement;

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Image, ImageUpload, UploadAdapterPluginMock ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	afterEach( () => {
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should include ImageUploadEditing', () => {
		expect( editor.plugins.get( ImageUploadEditing ) ).to.be.instanceOf( ImageUploadEditing );
	} );

	it( 'should include ImageUploadProgress', () => {
		expect( editor.plugins.get( ImageUploadProgress ) ).to.be.instanceOf( ImageUploadProgress );
	} );

	it( 'should include ImageUploadUI', () => {
		expect( editor.plugins.get( ImageUploadUI ) ).to.be.instanceOf( ImageUploadUI );
	} );
} );

