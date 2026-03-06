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
import { TableCaption } from '../../src/tablecaption.js';

const sourceElement = document.querySelector( '#editor-table-border-attribute' );
const clonedSource = sourceElement.cloneNode( true );

document.querySelector( '#cloned-source' ).append( ...clonedSource.childNodes );

ClassicEditor
	.create( sourceElement, {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet, Alignment, Indent, IndentBlock, TableCaption, TableProperties, TableCellProperties ],
		toolbar: [
			'heading', '|', 'insertTable', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
			tableToolbar: [ 'bold', 'italic' ]
		}
	} )
	.then( editor => {
		window.editor = editor;

		document.querySelector( '#cloned-source2' ).innerHTML = editor.getData();
	} )
	.catch( err => {
		console.error( err.stack );
	} );
