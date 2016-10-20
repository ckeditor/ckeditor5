/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document, setInterval */

import ClassicEditor from '/ckeditor5/editor-classic/classic.js';
import Enter from '/ckeditor5/enter/enter.js';
import Typing from '/ckeditor5/typing/typing.js';
import Paragraph from '/ckeditor5/paragraph/paragraph.js';
import Bold from '/ckeditor5/basic-styles/bold.js';
import Italic from '/ckeditor5/basic-styles/italic.js';

ClassicEditor.create( document.querySelector( '#editor' ), {
	features: [ Enter, Typing, Paragraph, Bold, Italic ],
	toolbar: [ 'bold', 'italic' ]
} )
.then( editor => {
	window.editor = editor;

	setInterval( () => {
		console.clear();

		console.log( editor.editing.view.getDomRoot().innerHTML.replace( /\u200b/g, '@' ) );
		console.log( 'selection.hasAttribute( italic )', editor.document.selection.hasAttribute( 'italic' ) );
		console.log( 'selection.hasAttribute( bold )', editor.document.selection.hasAttribute( 'bold' ) );
		console.log( 'selection anchor\'s parentNode', document.getSelection().anchorNode.parentNode );
	}, 2000 );
} )
.catch( err => {
	console.error( err.stack );
} );
