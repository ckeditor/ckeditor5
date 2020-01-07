/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals ClassicEditor, console, window, document */

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: {
			items: [
				'removeformat',
				'|',
				'bold',
				'italic',
				'underline',
				'strikethrough',
				'code',
				'subscript',
				'superscript',
				'fontSize',
				'fontFamily',
				'alignment',
				'link',
				'|',
				'undo',
				'redo'
			],
			viewportTopOffset: window.getViewportTopOffsetConfig()
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
