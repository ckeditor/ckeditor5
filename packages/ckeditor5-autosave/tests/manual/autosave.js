/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, window, console */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Autosave from '../../src/autosave';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Autosave ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ],
		}
	} )
	.then( editor => {
		window.editor = editor;

		const destroyButton = document.getElementById( 'destroy-editor-button' );
		destroyButton.addEventListener( 'click', () => editor.destroy() );

		const autosave = editor.plugins.get( Autosave );
		autosave.provider = {
			save() {
				const data = editor.getData();

				return saveEditorContentToDatabase( data );
			}
		};
	} );

function saveEditorContentToDatabase( data ) {
	return new Promise( res => {
		window.setTimeout( () => {
			console.log( data );

			res();
		}, 1000 );
	} );
}
