/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, console, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classic';
import ArticlePreset from '@ckeditor/ckeditor5-presets/src/article';
import BlockQuote from '../../src/blockquote';

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [
		ArticlePreset,
		BlockQuote
	],
	toolbar: [ 'headings', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ]
} )
.then( editor => {
	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
