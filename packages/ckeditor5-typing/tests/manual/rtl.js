/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '/ckeditor5/editor-classic/classic.js';
import { getData } from '/ckeditor5/engine/dev-utils/model.js';

const config = {
	features: [ 'enter', 'typing', 'paragraph', 'undo', 'basic-styles/bold', 'basic-styles/italic', 'heading' ],
	toolbar: [ 'headings', 'bold', 'italic', 'undo', 'redo' ]
};

window.setInterval( function() {
	if ( window.editor1.editing.view.isFocused ) {
		console.log( 'editor 1', getData( window.editor1.document ) );
	}

	if ( window.editor2.editing.view.isFocused ) {
		console.log( 'editor 2', getData( window.editor2.document ) );
	}
}, 3000 );

ClassicEditor.create( document.querySelector( '#editor1' ), config )
.then( editor => {
	window.editor1 = editor;
} )
.catch( err => {
	console.error( err.stack );
} );

ClassicEditor.create( document.querySelector( '#editor2' ), config )
.then( editor => {
	window.editor2 = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
