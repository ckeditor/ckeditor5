/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '../_utils/articlepluginset';

// Replace original submit method to prevent page reload.
document.getElementById( 'form' ).submit = () => {};

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet ],
		toolbar: [ 'bold', 'italic', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
		const form = document.getElementById( 'form' );

		document.getElementById( 'submit-with-js' ).addEventListener( 'click', () => {
			form.submit();
		} );

		form.addEventListener( 'submit', evt => {
			evt.preventDefault();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
