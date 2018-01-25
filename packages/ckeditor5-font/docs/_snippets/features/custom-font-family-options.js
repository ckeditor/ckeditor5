/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */
ClassicEditor
	.create( document.querySelector( '#snippet-custom-font-family-options' ), {
		toolbar: {
			items: [
				'headings', 'bulletedList', 'numberedList', 'fontFamily', 'undo', 'redo'
			],
			viewportTopOffset: 60
		},
		fontFamily: {
			options: [
				'default',
				'Ubuntu, Arial, sans-serif',
				'Ubuntu Mono, Courier New, Courier, monospace'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
