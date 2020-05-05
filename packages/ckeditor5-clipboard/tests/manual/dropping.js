/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
// import { stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
		const viewDocument = editor.editing.view.document;
		// const clipboard = editor.plugins.get( 'Clipboard' );

		viewDocument.on( 'drop', ( evt, data ) => {
			console.clear();

			console.log( '----- drop -----' );
			console.log( data );
			console.log( 'text/html\n', data.dataTransfer.getData( 'text/html' ) );
			console.log( 'text/plain\n', data.dataTransfer.getData( 'text/plain' ) );

			data.preventDefault();
			evt.stop();

			editor.model.change( writer => {
				const dropRange = editor.editing.mapper.toModelRange( data.dropRange );
				writer.insert( writer.createText( '@' ), dropRange.start );
				writer.setSelection( dropRange );
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
