/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '/ckeditor5/editor-classic/classic.js';
import Typing from '/ckeditor5/typing/typing.js';
import Paragraph from '/ckeditor5/paragraph/paragraph.js';
import Undo from '/ckeditor5/undo/undo.js';
import Enter from '/ckeditor5/enter/enter.js';
import Clipboard from '/ckeditor5/clipboard/clipboard.js';
import Link from '/ckeditor5/link/link.js';
import List from '/ckeditor5/list/list.js';
import Heading from '/ckeditor5/heading/heading.js';
import Bold from '/ckeditor5/basic-styles/bold.js';
import Italic from '/ckeditor5/basic-styles/italic.js';

import { stringify as stringifyView } from '/ckeditor5/engine/dev-utils/view.js';

ClassicEditor.create( document.querySelector( '#editor' ), {
	features: [
		Typing,
		Paragraph,
		Undo,
		Enter,
		Clipboard,
		Link,
		List,
		Heading,
		Bold,
		Italic
	],
	toolbar: [ 'headings', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo' ]
} )
.then( editor => {
	window.editor = editor;

	editor.editing.view.on( 'paste', ( evt, data ) => {
		console.log( '----- paste -----' );
		console.log( data );
		console.log( 'text/html\n', data.dataTransfer.getData( 'text/html' ) );
		console.log( 'text/plain\n', data.dataTransfer.getData( 'text/plain' ) );
	} );

	editor.editing.view.on( 'clipboardInput', ( evt, data ) => {
		console.log( '----- clipboardInput -----' );
		console.log( 'data.content\n', data.content );
		console.log( 'stringify( data.content )\n', stringifyView( data.content ) );
	} );
} )
.catch( err => {
	console.error( err.stack );
} );
