/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import TableCellProperties from '@ckeditor/ckeditor5-table/src/tablecellproperties.js';
import TableProperties from '@ckeditor/ckeditor5-table/src/tableproperties.js';
import TableCaption from '@ckeditor/ckeditor5-table/src/tablecaption.js';
import TableColumnResize from '@ckeditor/ckeditor5-table/src/tablecolumnresize.js';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';
import ShowBlocks from '@ckeditor/ckeditor5-show-blocks/src/showblocks.js';
import SourceEditing from '@ckeditor/ckeditor5-source-editing/src/sourceediting.js';
// import Style from '@ckeditor/ckeditor5-style/src/style.js';

import List from '../../src/list.js';
import ListProperties from '../../src/listproperties.js';

const config = {
	plugins: [
		Essentials, Heading, Paragraph, List, ListProperties, Table, TableCellProperties, TableProperties, TableToolbar,
		TableCaption, TableColumnResize, SourceEditing, ShowBlocks, Indent
	],
	toolbar: [
		'undo', 'redo',
		'|',
		'sourceEditing', 'showBlocks',
		'|',
		'heading',
		'|',
		'bulletedList', 'numberedList', 'outdent', 'indent',
		'|',
		'insertTable'
	],
	table: {
		contentToolbar: [
			'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties', 'toggleTableCaption'
		]
	},
	list: {
		properties: {
			styles: true,
			startIndex: true,
			reversed: true
		}
	}
};

ClassicEditor
	.create( document.querySelector( '#editor-list-overlapping' ), config )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-list-overlapping-rtl' ), {
		...config,
		language: 'ar'
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
