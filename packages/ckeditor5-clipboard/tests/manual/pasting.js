/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

import { _stringifyView } from '@ckeditor/ckeditor5-engine';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
		const clipboard = editor.plugins.get( 'ClipboardPipeline' );

		editor.editing.view.document.on( 'paste', ( evt, data ) => {
			console.clear();

			console.log( '----- paste -----' );
			console.log( data );
			console.log( 'text/html\n', data.dataTransfer.getData( 'text/html' ) );
			console.log( 'text/plain\n', data.dataTransfer.getData( 'text/plain' ) );
		} );

		clipboard.on( 'inputTransformation', ( evt, data ) => {
			console.log( '----- clipboardInput -----' );
			console.log( 'stringify( data.dataTransfer )\n', _stringifyView( data.content ) );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
