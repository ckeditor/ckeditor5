/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';

import { stringify as stringifyView } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
		const viewDocument = editor.editing.view.document;
		const clipboard = editor.plugins.get( 'ClipboardPipeline' );

		viewDocument.on( 'paste', ( evt, data ) => {
			console.clear();
			onViewEvent( evt, data );
		} );
		viewDocument.on( 'paste', onViewEvent );
		viewDocument.on( 'copy', onViewEvent, { priority: 'lowest' } );
		viewDocument.on( 'cut', onViewEvent, { priority: 'lowest' } );

		clipboard.on( 'inputTransformation', onPipelineEvent );
		viewDocument.on( 'clipboardOutput', ( evt, data ) => {
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
