/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import WordCount from '../../src/wordcount';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, WordCount ],
		toolbar: [
			'heading', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'link', 'undo', 'redo'
		],
		wordCount: {
			onUpdate: values => {
				console.log( `Values from 'onUpdate': ${ JSON.stringify( values ) }` );
			},
			container: document.getElementById( 'other-words-container' )
		}
	} )
	.then( editor => {
		window.editor = editor;

		document.getElementById( 'destroy-editor' ).addEventListener( 'click', () => {
			editor.destroy();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
