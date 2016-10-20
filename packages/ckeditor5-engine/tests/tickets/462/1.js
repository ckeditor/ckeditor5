/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document, setInterval */

import ClassicEditor from '/ckeditor5/editor-classic/classic.js';

ClassicEditor.create( document.querySelector( '#editor' ), {
	features: [ 'enter', 'typing', 'paragraph', 'basic-styles/bold', 'basic-styles/italic' ],
	toolbar: [ 'bold', 'italic' ]
} )
.then( editor => {
	window.editor = editor;

	setInterval( () => {
		console.clear();

		const domSelection = document.getSelection();
		const selectionExists = domSelection && domSelection.anchorNode;

		console.log( editor.editing.view.getDomRoot().innerHTML.replace( /\u200b/g, '@' ) );
		console.log( 'selection.hasAttribute( italic ):', editor.document.selection.hasAttribute( 'italic' ) );
		console.log( 'selection.hasAttribute( bold ):', editor.document.selection.hasAttribute( 'bold' ) );
		console.log( 'selection anchor\'s parentNode:', selectionExists ? domSelection.anchorNode.parentNode : 'no DOM selection' );
	}, 2000 );
} )
.catch( err => {
	console.error( err.stack );
} );
