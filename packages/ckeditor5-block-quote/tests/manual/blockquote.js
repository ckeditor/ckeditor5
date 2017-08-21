/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePreset from '@ckeditor/ckeditor5-presets/src/article';

import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [
			ArticlePreset
		],
		toolbar: [ 'headings', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

window.setInterval( function() {
	console.log( getData( window.editor.document ) );
}, 3000 );
