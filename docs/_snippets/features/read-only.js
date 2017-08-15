/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import ArticlePreset from '@ckeditor/ckeditor5-presets/src/article';

ClassicEditor
	.create( document.querySelector( '#snippet-read-only' ), {
		plugins: [ ArticlePreset ],
		toolbar: [ 'headings', 'bold', 'italic', 'link', 'unlink', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
		image: {
			toolbar: [ 'imageStyleFull', 'imageStyleSide', '|', 'imageTextAlternative' ]
		}
	} )
	.then( editor => {
		window.editor = editor;

		const button = document.querySelector( '#snippet-read-only-toggle' );

		button.addEventListener( 'click', () => {
			editor.isReadOnly = !editor.isReadOnly;

			button.innerText = editor.isReadOnly ? 'Switch to editable mode' : 'Switch to read-only mode';
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
