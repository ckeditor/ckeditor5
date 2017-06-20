/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console:false, document, window */

import InlineEditor from '../../../../src/inlineeditor';
import ArticlePreset from '@ckeditor/ckeditor5-presets/src/article';

InlineEditor.create( document.querySelector( '#editor' ), {
	plugins: [ ArticlePreset ],
	toolbar: [ 'headings', 'bold', 'italic', 'link', 'unlink', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ]
} )
.then( editor => {
	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );
