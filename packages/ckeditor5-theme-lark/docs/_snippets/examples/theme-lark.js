/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document */

/* config { "sassImportPath": "./custom.scss" } */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import './extras.scss';

ClassicEditor
	.create( document.querySelector( '#snippet-classic-editor' ), {
		plugins: [ ArticlePluginSet ],
		toolbar: {
			items: [ 'headings', 'bold', 'italic', 'link', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
			viewportTopOffset: 60
		},
		image: {
			toolbar: [ 'imageStyleFull', 'imageStyleSide', '|', 'imageTextAlternative' ]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
