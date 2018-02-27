/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */
ClassicEditor
	.create( document.querySelector( '#snippet-custom-highlight-colors-normal' ), {
		toolbar: {
			items: [
				'headings', '|', 'bulletedList', 'numberedList', 'highlightDropdown', 'undo', 'redo'
			],
			viewportTopOffset: 60
		},
		highlight: {
			options: [
				{
					model: 'greenMarker',
					class: 'marker-green',
					title: 'Green marker',
					color: 'rgb(24, 201, 32)',
					type: 'marker'
				},
				{
					model: 'yellowMarker',
					class: 'marker-yellow',
					title: 'Yellow marker',
					color: '#f2ee28',
					type: 'marker'
				},
				{
					model: 'redPen',
					class: 'pen-red',
					title: 'Red pen',
					color: 'hsl(355, 78%, 49%)',
					type: 'pen'
				},
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
