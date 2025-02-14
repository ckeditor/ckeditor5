/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, document, window, CKEditorInspector  */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import Table from '../../src/table.js';
import TableToolbar from '../../src/tabletoolbar.js';
import TableSelection from '../../src/tableselection.js';
import TableClipboard from '../../src/tableclipboard.js';
import TableProperties from '../../src/tableproperties.js';
import TableCellProperties from '../../src/tablecellproperties.js';
import TableColumnResize from '../../src/tablecolumnresize.js';
import PlainTableOutput from '../../src/plaintableoutput.js';
import TableLayout from '../../src/tablelayout.js';

window.editors = {};

const config = {
	image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
	plugins: [
		ArticlePluginSet,
		Table,
		TableToolbar,
		TableSelection,
		TableClipboard,
		TableProperties,
		TableCellProperties,
		TableColumnResize,
		TableLayout
	],
	toolbar: [
		'heading', '|',
		'insertTable', '|',
		'bold', 'italic', 'link', '|',
		'bulletedList', 'numberedList', 'blockQuote', '|',
		'undo', 'redo'
	],
	table: {
		contentToolbar: [
			'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties'
		]
	}
};

ClassicEditor
	.create( document.querySelector( '#editor' ), config )
	.then( editor => {
		window.editors.editor = editor;
		CKEditorInspector.attach( { editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const { plugins, ...configWithoutPlugins } = config;

ClassicEditor
	.create( document.querySelector( '#editor-with-plain-table-output' ), {
		...configWithoutPlugins,
		plugins: [
			...plugins,
			PlainTableOutput
		]
	} )
	.then( editor => {
		window.editors.editorWithPTO = editor;
		CKEditorInspector.attach( { editorWithPTO: editor } );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
