/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePreset from '@ckeditor/ckeditor5-presets/src/article';

ClassicEditor
	.create( document.querySelector( '#snippet-custom-heading-levels' ), {
		plugins: [ ArticlePreset ],
		toolbar: [ 'headings', 'bold', 'italic', 'link', 'unlink', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
		image: {
			toolbar: [ 'imageStyleFull', 'imageStyleSide', '|', 'imageTextAlternative' ]
		},
		heading: {
			options: [
				{ modelElement: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
				{ modelElement: 'heading1', viewElement: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
				{ modelElement: 'heading2', viewElement: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' }
			]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
