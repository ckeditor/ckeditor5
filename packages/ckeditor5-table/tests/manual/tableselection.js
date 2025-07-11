/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { Table } from '../../src/table.js';
import { TableToolbar } from '../../src/tabletoolbar.js';
import { _getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { TableSelection } from '../../src/tableselection.js';
import { TableClipboard } from '../../src/tableclipboard.js';
import { TableProperties } from '../../src/tableproperties.js';
import { TableCellProperties } from '../../src/tablecellproperties.js';

window.editors = {};

createEditor( '#editor-content', 'content' );
createEditor( '#editor-geometry', 'geometry' );

function createEditor( target, inspectorName ) {
	ClassicEditor
		.create( document.querySelector( target ), {
			plugins: [ ArticlePluginSet, Table, TableToolbar, TableSelection, TableClipboard, TableProperties, TableCellProperties ],
			toolbar: [
				'heading', '|',
				'insertTable', '|',
				'bold', 'italic', 'link', '|',
				'bulletedList', 'numberedList', 'blockQuote', '|',
				'undo', 'redo'
			],
			image: {
				toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
			},
			table: {
				contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ]
			}
		} )
		.then( editor => {
			window.editors[ inspectorName ] = editor;
			CKEditorInspector.attach( { [ inspectorName ]: editor } );

			editor.model.document.on( 'change', () => {
				printModelContents( editor );
			} );
		} )
		.catch( err => {
			console.error( err.stack );
		} );
}

const modelDiv = document.querySelector( '#model' );

function printModelContents( editor ) {
	modelDiv.innerHTML = formatTable( _getModelData( editor.model ) )
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
