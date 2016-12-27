/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from 'ckeditor5-editor-classic/src/classic';
import Autoformat from 'ckeditor5-autoformat/src/autoformat';
import Enter from 'ckeditor5-enter/src/enter';
import List from 'ckeditor5-list/src/list';
import Typing from 'ckeditor5-typing/src/typing';
import Heading from 'ckeditor5-heading/src/heading';
import Paragraph from 'ckeditor5-paragraph/src/paragraph';
import Undo from 'ckeditor5-undo/src/undo';
import Bold from 'ckeditor5-basic-styles/src/bold';
import Italic from 'ckeditor5-basic-styles/src/italic';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Enter, Typing, Paragraph, Undo, Bold, Italic, Heading, List, Autoformat ],
	toolbar: [ 'headings', 'numberedList', 'bulletedList', 'bold', 'italic', 'undo', 'redo' ]
} )
.then( editor => {
	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
