/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '/ckeditor5/editor-classic/classic.js';

ClassicEditor.create( document.querySelector( '#editor' ), {
	features: [
		'typing',
		'paragraph',
		'undo',
		'enter',
		'clipboard',
		'link',
		'list',
		'heading',
		'basic-styles/bold',
		'basic-styles/italic'
	],
	toolbar: [ 'headings', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo' ]
} )
.then( editor => {
	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
