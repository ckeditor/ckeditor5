/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock.js';
import Indent from '@ckeditor/ckeditor5-indent/src/indent.js';

import TableProperties from '../../src/tableproperties.js';
import TableCellProperties from '../../src/tablecellproperties.js';

const sourceElement = document.querySelector( '#editor' );
const clonedSource = sourceElement.cloneNode( true );

document.querySelector( '#cloned-source' ).append( ...clonedSource.childNodes );

ClassicEditor
	.create( sourceElement, {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [ ArticlePluginSet, Alignment, Indent, IndentBlock, TableProperties, TableCellProperties ],
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
	} )
	.catch( err => {
		console.error( err.stack );
	} );
