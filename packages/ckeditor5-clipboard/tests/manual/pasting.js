/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from 'ckeditor5-editor-classic/src/classic';
import Typing from 'ckeditor5-typing/src/typing';
import Paragraph from 'ckeditor5-paragraph/src/paragraph';
import Undo from 'ckeditor5-undo/src/undo';
import Enter from 'ckeditor5-enter/src/enter';
import Clipboard from 'ckeditor5-clipboard/src/clipboard';
import Link from 'ckeditor5-link/src/link';
import List from 'ckeditor5-list/src/list';
import Heading from 'ckeditor5-heading/src/heading';
import Bold from 'ckeditor5-basic-styles/src/bold';
import Italic from 'ckeditor5-basic-styles/src/italic';

import { stringify as stringifyView } from 'ckeditor5-engine/src/dev-utils/view';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [
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
		console.clear();

		console.log( '----- paste -----' );
		console.log( data );
		console.log( 'text/html\n', data.dataTransfer.getData( 'text/html' ) );
		console.log( 'text/plain\n', data.dataTransfer.getData( 'text/plain' ) );
	} );

	editor.editing.view.on( 'clipboardInput', ( evt, data ) => {
		console.log( '----- clipboardInput -----' );
		console.log( 'stringify( data.content )\n', stringifyView( data.content ) );
	} );
} )
.catch( err => {
	console.error( err.stack );
} );
