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
		console.clear();
		onViewEvent( evt, data );
	} );
	editor.editing.view.on( 'paste', onViewEvent );
	editor.editing.view.on( 'copy', onViewEvent, { priority: 'lowest' } );
	editor.editing.view.on( 'cut', onViewEvent, { priority: 'lowest' } );

	editor.editing.view.on( 'clipboardInput', onPipelineEvent );
	editor.editing.view.on( 'clipboardOutput', ( evt, data ) => {
		console.clear();
		onPipelineEvent( evt, data );
	} );

	function onViewEvent( evt, data ) {
		console.log( `----- ${ evt.name } -----` );
		console.log( 'text/html\n', data.dataTransfer.getData( 'text/html' ) );
	}

	function onPipelineEvent( evt, data ) {
		console.log( `----- ${ evt.name } -----` );
		console.log( 'stringify( data.content )\n', stringifyView( data.content ) );
	}
} )
.catch( err => {
	console.error( err.stack );
} );

document.getElementById( 'native' ).addEventListener( 'paste', onNativeEvent );
document.getElementById( 'native' ).addEventListener( 'copy', onNativeEvent );
document.getElementById( 'native' ).addEventListener( 'cut', onNativeEvent );

function onNativeEvent( evt ) {
	console.clear();
	console.log( `----- native ${ evt.type } -----` );

	if ( evt.type == 'paste' ) {
		console.log( 'text/html\n', evt.clipboardData.getData( 'text/html' ) );
	}
}
