/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { IndentBlock, Indent } from '@ckeditor/ckeditor5-indent';

import { TableProperties } from '../../src/tableproperties.js';
import { TableCellProperties } from '../../src/tablecellproperties.js';

const styleAsPlainText = document.querySelector( '#table-properties-styles' ).innerText
	.trim()
	.split( '\n' )
	.map( line => line.replace( /^\t/, '' ) )
	.join( '\n' );

document.querySelector( '#table-properties-styles-preview' ).innerText = styleAsPlainText;

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet, Alignment, Indent, IndentBlock, TableProperties, TableCellProperties ],
		toolbar: [
			'heading', '|', 'insertTable', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
			tableToolbar: [ 'bold', 'italic' ],
			tableProperties: {
				defaultProperties: {
					borderStyle: 'dashed',
					borderColor: 'hsl(0, 0%, 60%)',
					borderWidth: '3px',
					backgroundColor: '#00f',
					alignment: 'left',
					width: '300px',
					height: '250px'
				}
			},
			tableCellProperties: {
				defaultProperties: {
					borderStyle: 'dotted',
					borderColor: 'hsl(120, 75%, 60%)',
					borderWidth: '2px',
					horizontalAlignment: 'right',
					verticalAlignment: 'bottom',
					padding: '10px'
				}
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		document.querySelector( '#preview' ).innerHTML = editor.getData();

		editor.model.document.on( 'change:data', () => {
			document.querySelector( '#preview' ).innerHTML = editor.getData();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
