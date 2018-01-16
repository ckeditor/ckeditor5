/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document */

ClassicEditor
	.create( document.querySelector( '#snippet-custom-heading-levels' ), {
		heading: {
			options: [
				{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
				{ model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
				{ model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
			]
		},
		toolbar: {
			viewportTopOffset: 60
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
