/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, window, document */

import ClassicEditor from '/ckeditor5/editor-classic/classic.js';

ClassicEditor.create( document.querySelector( '#editor' ), {
	features: [ 'link', 'typing', 'paragraph', 'undo' ],
	toolbar: [ 'link', 'undo', 'redo' ]
} )
.then( editor => {
	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );

ClassicEditor.create( document.querySelector( '#editor-balloon-demo' ), {
	features: [ 'link', 'typing', 'paragraph', 'undo' ],
	toolbar: [ 'link', 'undo', 'redo' ]
} )
.then( editor => {
	editor.ui.view.element.classList.add( 'ck-editor_balloon-demo' );
} )
.catch( err => {
	console.error( err.stack );
} );
