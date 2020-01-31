/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, global */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Table from '../../src/table';
import TableToolbar from '../../src/tabletoolbar';
import { getData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import TableSelection from '../../src/tableselection';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ ArticlePluginSet, Table, TableToolbar, TableSelection ],
		toolbar: [
			'heading', '|', 'insertTable', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ]
		}
	} )
	.then( editor => {
		window.editor = editor;
		editor.model.document.on( 'change', () => {
			printModelContents( editor );
		} );

		printModelContents( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

const modelDiv = global.document.querySelector( '#model' );

function printModelContents( editor ) {
	modelDiv.innerHTML = formatTable( getData( editor.model ) )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		.replace( /\n/g, '<br>' )
		.replace( /\[/g, '<span class="print-selected">[' )
		.replace( /]/g, ']</span>' );
}

function formatTable( tableString ) {
	return tableString
		.replace( /<table>/g, '\n<table' )
		.replace( /<table /g, '\n<table ' )
		.replace( /<tableRow>/g, '\n<tableRow>\n    ' )
		.replace( /<thead>/g, '\n<thead>\n    ' )
		.replace( /<tbody>/g, '\n<tbody>\n    ' )
		.replace( /<tr>/g, '\n<tr>\n    ' )
		.replace( /<\/tableRow>/g, '\n</tableRow>' )
		.replace( /<\/thead>/g, '\n</thead>' )
		.replace( /<\/tbody>/g, '\n</tbody>' )
		.replace( /<\/tr>/g, '\n</tr>' )
		.replace( /<\/table>/g, '\n</table>' )
		.replace( /tableCell/g, 'cell' )
		.replace( /tableRow/g, 'row' )
		.replace( /paragraph/g, 'p' );
}
