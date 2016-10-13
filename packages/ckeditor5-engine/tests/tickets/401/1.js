/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, document, window */

import ClassicEditor from '/ckeditor5/editor-classic/classic.js';

ClassicEditor.create( document.getElementById( 'editor' ), {
	features: [ 'enter', 'typing', 'paragraph', 'basic-styles/bold' ],
	toolbar: [ 'bold' ]
} )
.then( editor => {
	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
