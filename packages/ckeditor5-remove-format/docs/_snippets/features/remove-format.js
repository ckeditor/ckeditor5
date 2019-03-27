/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		toolbar: {
			items: [
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
				'removeformat',
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
