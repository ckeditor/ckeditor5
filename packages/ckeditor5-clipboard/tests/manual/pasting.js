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

	editor.editing.view.on( 'paste', ( evt, data ) => {
		console.log( '----- paste -----' );
		console.log( data );
		console.log( 'text/html', data.dataTransfer.getData( 'text/html' ) );
		console.log( 'text/plain', data.dataTransfer.getData( 'text/plain' ) );
	} );

	editor.editing.view.on( 'clipboardInput', ( evt, data ) => {
		console.log( '----- clipboardInput -----' );
		console.log( data.dataValue );
	} );
} )
.catch( err => {
	console.error( err.stack );
} );
