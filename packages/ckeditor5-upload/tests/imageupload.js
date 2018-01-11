/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '../src/imageupload';
import ImageUploadProgress from '../src/imageuploadprogress';
import ImageUploadButton from '../src/imageuploadbutton';

import { UploadAdapterPluginMock } from './_utils/mocks';

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

	it( 'should include ImageUploadProgress', () => {
		expect( editor.plugins.get( ImageUploadProgress ) ).to.be.instanceOf( ImageUploadProgress );
	} );

	it( 'should include ImageUploadButton', () => {
		expect( editor.plugins.get( ImageUploadButton ) ).to.be.instanceOf( ImageUploadButton );
	} );
} );

