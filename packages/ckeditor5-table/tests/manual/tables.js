/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '../../../ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '../../../ckeditor5-core/tests/_utils/articlepluginset';
import Tables from '../../src/tables';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Tables ],
		toolbar: [
			'headings', '|', 'bold', 'italic', 'undo', 'redo'
		]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
