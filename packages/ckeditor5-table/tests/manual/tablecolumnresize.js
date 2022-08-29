/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, document, window */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Table from '../../src/table';
import TableToolbar from '../../src/tabletoolbar';
import TableSelection from '../../src/tableselection';
import TableClipboard from '../../src/tableclipboard';
import TableProperties from '../../src/tableproperties';
import TableCellProperties from '../../src/tablecellproperties';
import TableCaption from '../../src/tablecaption';
import TableColumnResize from '../../src/tablecolumnresize';

const editorConfig = {
	image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
	plugins: [
		ArticlePluginSet,
		Table,
		TableToolbar,
		TableSelection,
		TableClipboard,
		TableProperties,
		TableCellProperties,
		TableCaption,
		TableColumnResize
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
			'tableColumn',
			'tableRow',
			'mergeTableCells',
			'tableProperties',
			'tableCellProperties',
			'toggleTableCaption'
		]
	}
};

ClassicEditor
	.create( document.querySelector( '#editor' ), editorConfig )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( document.querySelector( '#editor-rtl' ), Object.assign( {}, editorConfig, {
		language: 'ar'
	} ) )
	.then( editor => {
		window.editorRTL = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

document.querySelector( 'button#read-only' ).addEventListener( 'click', () => {
	window.editor.isReadOnly ? window.editor.disableReadOnlyMode( 'test' ) : window.editor.enableReadOnlyMode( 'test' );
	window.editorRTL.isReadOnly ? window.editorRTL.disableReadOnlyMode( 'test' ) : window.editorRTL.enableReadOnlyMode( 'test' );
} );
