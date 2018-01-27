/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */
ClassicEditor
	.create( document.querySelector( '#snippet-custom-highlight-options' ), {
		toolbar: {
			items: [
				'headings', 'bulletedList', 'numberedList', 'highlightDropdown', 'undo', 'redo'
			],
			viewportTopOffset: 60
		},
		highlight: {
			options: [
				{ model: 'greenMarker', class: 'marker-green', title: 'Green marker', color: '#66ff00', type: 'marker' },
				{ model: 'bluePen', class: 'pen-blue', title: 'Blue pen', color: '#0091ff', type: 'pen' }
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
