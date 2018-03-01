/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

ClassicEditor
	.create( document.querySelector( '#snippet-highlight-buttons' ), {
		toolbar: {
			items: [
				'headings', '|', 'highlight:yellowMarker', 'highlight:greenMarker', 'highlight:pinkMarker',
				'highlight:greenPen', 'highlight:redPen', 'removeHighlight', '|', 'undo', 'redo'
			],
			viewportTopOffset: 60
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
