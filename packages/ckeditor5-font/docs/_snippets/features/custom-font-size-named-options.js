/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */
ClassicEditor
	.create( document.querySelector( '#snippet-custom-font-size-named-options' ), {
		toolbar: {
			items: [
				'headings', 'bulletedList', 'numberedList', 'fontSize', 'undo', 'redo'
			],
			viewportTopOffset: 60
		},
		fontSize: {
			options: [
				'small',
				'normal',
				'big'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
