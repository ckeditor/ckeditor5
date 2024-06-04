/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document, window, CKEditorInspector */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import Table from '../../src/table.js';
import TableToolbar from '../../src/tabletoolbar.js';
import TableSelection from '../../src/tableselection.js';
import TableClipboard from '../../src/tableclipboard.js';
import TableProperties from '../../src/tableproperties.js';
import TableCellProperties from '../../src/tablecellproperties.js';

window.editors = {};

createEditor( '#editor-content', 'content' );
createEditor( '#editor-geometry', 'geometry' );

function createEditor( target, inspectorName ) {
	ClassicEditor
		.create( document.querySelector( target ), {
			image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
			plugins: [ ArticlePluginSet, Table, TableToolbar, TableSelection, TableClipboard, TableProperties, TableCellProperties ],
			toolbar: [
				'heading', '|',
				'insertTable', '|',
				'bold', 'italic', 'link', '|',
				'bulletedList', 'numberedList', 'blockQuote', '|',
				'undo', 'redo'
			],
			table: {
				contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ]
			}
		} )
		.then( editor => {
			window.editors[ inspectorName ] = editor;
			CKEditorInspector.attach( inspectorName, editor );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}
