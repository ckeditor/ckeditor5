/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ImageEditing from '../../src/image/imageediting';
import ImageUploadEditing from '../../src/imageupload/imageuploadediting';
import ImageUploadProgress from '../../src/imageupload/imageuploadprogress';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ ImageEditing, ImageUploadEditing, ImageUploadProgress ]
} )
	.then( editor => {
		window.editor = editor;

		editor.model.change( writer => {
			writer.appendElement( 'image', {
				uploadId: 'fake',
				uploadStatus: 'uploading'
			}, editor.model.document.getRoot() );
		} );
	} )
	.catch( error => {
		console.error( error );
	} );

