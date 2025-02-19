/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, document, window  */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { HorizontalLine } from '@ckeditor/ckeditor5-horizontal-line';
import Table from '../../src/table.js';
import TableToolbar from '../../src/tabletoolbar.js';
import TableSelection from '../../src/tableselection.js';
import TableClipboard from '../../src/tableclipboard.js';
import TableProperties from '../../src/tableproperties.js';
import TableCellProperties from '../../src/tablecellproperties.js';
import TableColumnResize from '../../src/tablecolumnresize.js';
import TableCaption from '../../src/tablecaption.js';
import PlainTableOutput from '../../src/plaintableoutput.js';
import TableLayout from '../../src/tablelayout.js';

window.editors = {};

const config = {
	image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
	plugins: [
		ArticlePluginSet,
		HorizontalLine,
		Table,
		TableToolbar,
		TableSelection,
		TableClipboard,
		TableProperties,
		TableCellProperties,
		TableColumnResize,
		TableCaption,
		PlainTableOutput,
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
			'tableColumn', 'tableRow', 'mergeTableCells',
			'tableProperties', 'tableCellProperties', 'toggleTableCaption'
		]
	}
};

ClassicEditor
	.create( document.querySelector( '#editor' ), config )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
