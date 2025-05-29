/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import WordCount from '../../src/wordcount.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet, WordCount ],
		toolbar: [
			'heading', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'link', 'undo', 'redo'
		],
		wordCount: {
			onUpdate: values => {
				console.log( `Values from 'onUpdate': ${ JSON.stringify( values ) }` );
			},
			container: document.getElementById( 'words-container' )
		}
	} )
	.then( editor => {
		window.editor = editor;

		document.getElementById( 'destroy-editor' ).addEventListener( 'click', () => {
			editor.destroy();
		} );

		editor.plugins.get( 'WordCount' ).on( 'change:words', ( evt, name, value ) => {
			console.log( 'WordCount:change:words', value );
		} );

		editor.plugins.get( 'WordCount' ).on( 'change:characters', ( evt, name, value ) => {
			console.log( 'WordCount:change:characters', value );
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
