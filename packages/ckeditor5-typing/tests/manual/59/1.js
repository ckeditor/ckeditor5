/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, document, window */

import ClassicEditor from '/ckeditor5/editor-classic/classic.js';
import Typing from '/ckeditor5/typing/typing.js';
import Paragraph from '/ckeditor5/paragraph/paragraph.js';
import Bold from '/ckeditor5/basic-styles/bold.js';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Typing, Paragraph, Bold ],
	toolbar: [ 'bold' ]
} )
.then( editor => {
	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
