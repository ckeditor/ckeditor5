/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '../../../ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '../../../ckeditor5-core/tests/_utils/articlepluginset';
import Highlight from '../../src/highlight';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Highlight ],
		toolbar: [
			'headings', 'bold', 'italic', 'link', 'mark', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
		]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
