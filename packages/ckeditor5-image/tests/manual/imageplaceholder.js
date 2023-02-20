/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ImageBlockEditing from '../../src/image/imageblockediting';
import ImageUploadEditing from '../../src/imageupload/imageuploadediting';
import ImageUploadProgress from '../../src/imageupload/imageuploadprogress';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ ImageBlockEditing, ImageUploadEditing, ImageUploadProgress ]
} )
	.then( editor => {
		window.editor = editor;

		editor.model.change( writer => {
			writer.appendElement( 'imageBlock', {
				uploadId: 'fake',
				uploadStatus: 'uploading'
			}, editor.model.document.getRoot() );
		} );
	} )
	.catch( error => {
		console.error( error );
	} );

