/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Image from '../src/image';
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
