/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	ClassicEditor,
	Bold,
	Essentials,
	Italic,
	Paragraph,
	Table,
	TableCaption,
	TableCellProperties,
	TableColumnResize,
	TableProperties,
	TableScroll,
	TableToolbar,
	Undo
} from 'ckeditor5';

ClassicEditor
	.create( document.querySelector( '#snippet-table-scroll' ), {
		licenseKey: 'GPL',
		plugins: [
			Bold,
			Essentials,
			Italic,
			Paragraph,
			Table,
			TableCaption,
			TableCellProperties,
			TableColumnResize,
			TableProperties,
			TableScroll,
			TableToolbar,
			Undo
		],
		toolbar: [
			'undo', 'redo', '|',
			'bold', 'italic', '|',
			'insertTable'
		],
		table: {
			contentToolbar: [
				'tableColumn', 'tableRow', 'mergeTableCells',
				'tableProperties', 'tableCellProperties'
			]
		}
	} )
	.then( editor => {
		window.editor = editor;

		if ( window.CKEditorInspector ) {
			window.CKEditorInspector.attach( editor );
		}
	} )
	.catch( error => {
		console.error( error );
	} );
