/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Clipboard from '../../src/clipboard';
import Link from '@ckeditor/ckeditor5-link/src/link';
import List from '@ckeditor/ckeditor5-list/src/list';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import { stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

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
	const clipboard = editor.plugins.get( 'clipboard/clipboard' );

	editor.editing.view.on( 'paste', ( evt, data ) => {
		console.clear();
		onViewEvent( evt, data );
	} );
	editor.editing.view.on( 'paste', onViewEvent );
	editor.editing.view.on( 'copy', onViewEvent, { priority: 'lowest' } );
	editor.editing.view.on( 'cut', onViewEvent, { priority: 'lowest' } );

	clipboard.on( 'inputTransformation', onPipelineEvent );
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
