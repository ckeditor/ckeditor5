/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document, window */

import ClassicEditor from 'ckeditor5/editor-classic/classic.js';
import Enter from 'ckeditor5/enter/enter.js';
import Typing from 'ckeditor5/typing/typing.js';
import Paragraph from 'ckeditor5/paragraph/paragraph.js';
import Heading from 'ckeditor5/heading/heading.js';
import Undo from 'ckeditor5/undo/undo.js';
import Bold from 'ckeditor5/basic-styles/bold.js';
import Italic from 'ckeditor5/basic-styles/italic.js';

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
