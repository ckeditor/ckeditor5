/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { IndentBlock, Indent } from '@ckeditor/ckeditor5-indent';

import {
	TableCellPropertiesEditing, TableCellPropertiesUI,
	TableLayout, TablePropertiesEditing, TablePropertiesUI
} from '../../src/index.js';

const sourceElement = document.querySelector( '#editor' );
const clonedSource = sourceElement.cloneNode( true );

document.querySelector( '#cloned-source' ).append( ...clonedSource.childNodes );

ClassicEditor
	.create( sourceElement, {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [
			ArticlePluginSet, Alignment, Indent, IndentBlock,
			TablePropertiesEditing, TablePropertiesUI,
			TableCellPropertiesEditing, TableCellPropertiesUI,
			TableLayout
		],
		toolbar: [
			'heading', '|', 'insertTable', '|', 'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
			useTfootElement: true,
			tableToolbar: [ 'bold', 'italic' ],
			tableCellProperties: {
				scopedHeaders: true
			}
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
