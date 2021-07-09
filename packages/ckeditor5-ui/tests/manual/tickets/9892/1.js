/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document, console:false */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet ],
		toolbar: {
			items: [ 'heading', '|', 'insertTable', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
			viewportTopOffset: 100
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
			tableToolbar: [ 'bold', 'italic' ]
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
