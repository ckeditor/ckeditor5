/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '/ckeditor5/editor-classic/classic.js';

ClassicEditor.create( document.querySelector( '#editor' ), {
	features: [ 'enter', 'typing', 'paragraph', 'heading', 'basic-styles/bold', 'basic-styles/italic' ],
	toolbar: [ 'headings', 'bold', 'italic' ]
} )
.then( editor => {
	window.editor = editor;

	const sel = editor.document.selection;

	sel.on( 'change', ( evt, data ) => {
		const date = new Date();
		console.log( `${ date.getSeconds() }s${ String( date.getMilliseconds() ).slice( 0, 2 ) }ms`, evt.name, data );
	} );
} )
.catch( err => {
	console.error( err.stack );
} );
