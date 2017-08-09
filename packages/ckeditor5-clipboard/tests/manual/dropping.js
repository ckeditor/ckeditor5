/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePreset from '@ckeditor/ckeditor5-presets/src/article';

import Text from '@ckeditor/ckeditor5-engine/src/model/text';
import Selection from '@ckeditor/ckeditor5-engine/src/model/selection';

// import { stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePreset ],
		toolbar: [ 'headings', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
		// const clipboard = editor.plugins.get( 'Clipboard' );

		editor.editing.view.on( 'drop', ( evt, data ) => {
			console.clear();

			console.log( '----- drop -----' );
			console.log( data );
			console.log( 'text/html\n', data.dataTransfer.getData( 'text/html' ) );
			console.log( 'text/plain\n', data.dataTransfer.getData( 'text/plain' ) );

			data.preventDefault();
			evt.stop();

			editor.document.enqueueChanges( () => {
				const insertAtSelection = new Selection( [ editor.editing.mapper.toModelRange( data.dropRange ) ] );
				editor.data.insertContent( new Text( '@' ), insertAtSelection );
				editor.document.selection.setTo( insertAtSelection );
			} );
		} );

		// Waiting until a real dropping support...
		// clipboard.on( 'inputTransformation', ( evt, data ) => {
		// 	console.log( '----- clipboardInput -----' );
		// 	console.log( 'stringify( data.dataTransfer )\n', stringifyView( data.content ) );
		// } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
