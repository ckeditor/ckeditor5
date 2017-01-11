/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document, window */

import ClassicEditor from 'ckeditor5-editor-classic/src/classic';
import Enter from 'ckeditor5-enter/src/enter';
import Typing from 'ckeditor5-typing/src/typing';
import Paragraph from 'ckeditor5-paragraph/src/paragraph';
import Heading from 'ckeditor5-heading/src/heading';
import Undo from 'ckeditor5-undo/src/undo';
import Bold from 'ckeditor5-basic-styles/src/bold';
import Italic from 'ckeditor5-basic-styles/src/italic';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Enter, Typing, Paragraph, Heading, Undo, Bold, Italic ],
	toolbar: [ 'headings', 'bold', 'italic', 'undo', 'redo' ]
} )
.then( editor => {
	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
