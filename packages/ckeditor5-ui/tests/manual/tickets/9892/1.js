/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties.js';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties.js';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet, TableProperties, TableCellProperties ],
		toolbar: {
			items: [ 'heading', '|', 'insertTable', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo' ],
			viewportTopOffset: 100
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', '|', 'tableProperties', 'tableCellProperties' ],
			tableToolbar: [ 'bold', 'italic' ]
		},
		ui: {
			viewportOffset: {
				top: 100,
				bottom: 100
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
