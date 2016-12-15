/* jshint browser: true */
/* global console */

import ClassicEditor from 'ckeditor5-editor-classic/src/classic';
import Enter from 'ckeditor5-enter/src/enter';
import Typing from 'ckeditor5-typing/src/typing';
import Paragraph from 'ckeditor5-paragraph/src/paragraph';
import Undo from 'ckeditor5-undo/src/undo';
import Bold from 'ckeditor5-basic-styles/src/bold';
import Italic from 'ckeditor5-basic-styles/src/italic';
import List from 'ckeditor5-list/src/list';
import Link from 'ckeditor5-link/src/link';
import Autoformat from 'ckeditor5-autoformat/src/autoformat';
import Heading from 'ckeditor5-heading/src/heading';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Enter, Typing, Paragraph, Undo, Bold, Italic, List, Link, Autoformat, Heading ],
	toolbar: [ 'headings', 'bold', 'italic', 'undo', 'redo', 'numberedList', 'bulletedList', 'link', 'unlink' ]
} ).then( editor => {
	window.editor = editor;
} ).catch( err => {
	console.error( err.stack );
} );
