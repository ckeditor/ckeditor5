/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Alignment from '../../src/alignment';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Alignment ],
		toolbar: [
			'headings', 'bold', 'italic', 'link', 'alignLeft', 'alignRight', 'alignCenter', 'alignJustify', 'bulletedList', 'numberedList',
			'blockQuote', 'undo', 'redo'
		]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
