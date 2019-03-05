/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

ClassicEditor
	.create( document.querySelector( '#snippet-ckfinder-options' ), {
		toolbar: {
			items: [
				'ckfinder', '|', 'heading', '|', 'bold', 'italic', '|', 'undo', 'redo'
			],
			viewportTopOffset: 100
		},
		ckfinder: {
			// eslint-disable-next-line max-len
			uploadUrl: 'https://ckeditor.com/apps/ckfinder/3.4.5/core/connector/php/connector.php?command=QuickUpload&type=Images&responseType=json',
			options: {
				height: 600,
				width: 800,
				resourceType: 'Images'
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
