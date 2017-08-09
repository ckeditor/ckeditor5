/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageUpload from '../src/imageupload';
import ImageUploadProgress from '../src/imageuploadprogress';
import ImageUploadButton from '../src/imageuploadbutton';

describe( 'ImageUpload', () => {
	let editor;

	beforeEach( () => {
		const editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicEditor
			.create( editorElement, {
				plugins: [ Image, ImageUpload ]
			} )
			.then( newEditor => {
				editor = newEditor;
			} );
	} );

	it( 'should include ImageUploadProgress', () => {
		expect( editor.plugins.get( ImageUploadProgress ) ).to.be.instanceOf( ImageUploadProgress );
	} );

	it( 'should include ImageUploadButton', () => {
		expect( editor.plugins.get( ImageUploadButton ) ).to.be.instanceOf( ImageUploadButton );
	} );
} );

