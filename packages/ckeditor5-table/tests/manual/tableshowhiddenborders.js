/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { IndentBlock, Indent } from '@ckeditor/ckeditor5-indent';

import { TableProperties } from '../../src/tableproperties.js';
import { TableCellProperties } from '../../src/tablecellproperties.js';

window.editors = {};

const sourceElementWithHiddenBorders = document.querySelector( '#editor-with-show-hidden-borders' );
const sourceElementWithoutHiddenBorders = document.querySelector( '#editor-without-show-hidden-borders' );

const config = {
	image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
	plugins: [ ArticlePluginSet, Alignment, Indent, IndentBlock, TableProperties, TableCellProperties ],
	toolbar: [
		'heading', '|', 'insertTable', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
	],
	table: {
		contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
		tableToolbar: [ 'bold', 'italic' ]
	}
};

ClassicEditor
	.create( sourceElementWithHiddenBorders, config )
	.then( editor => {
		window.editors[ 'editor-with-hidden-borders' ] = editor;
		CKEditorInspector.attach( 'editor-with-hidden-borders', editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ClassicEditor
	.create( sourceElementWithoutHiddenBorders,
		{
			...config,
			table: {
				...config.table,
				showHiddenBorders: false
			}
		}
	)
	.then( editor => {
		window.editors[ 'editor-without-hidden-borders' ] = editor;
		CKEditorInspector.attach( 'editor-without-hidden-borders', editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );
