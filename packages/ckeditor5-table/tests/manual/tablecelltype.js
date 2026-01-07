/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { Alignment } from '@ckeditor/ckeditor5-alignment';
import { IndentBlock, Indent } from '@ckeditor/ckeditor5-indent';

import {
	TableCellPropertiesEditing, TableCellPropertiesUIExperimental,
	TableLayout,
	TablePropertiesEditing, TablePropertiesUIExperimental
} from '../../src/index.js';

const sourceElement = document.querySelector( '#editor' );
const clonedSource = sourceElement.cloneNode( true );

document.querySelector( '#cloned-source' ).append( ...clonedSource.childNodes );

ClassicEditor
	.create( sourceElement, {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [
			ArticlePluginSet, Alignment, Indent, IndentBlock,
			TablePropertiesEditing, TablePropertiesUIExperimental,
			TableCellPropertiesEditing, TableCellPropertiesUIExperimental,
			TableLayout
		],
		toolbar: [
			'heading', '|',
			'insertTable', 'insertTableLayout', '|',
			'bold', 'italic', 'bulletedList', 'numberedList', 'blockQuote', 'undo', 'redo'
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
			tableToolbar: [ 'bold', 'italic' ]
		},
		experimentalFlags: {
			useExtendedTableBlockAlignment: true,
			tableCellTypeSupport: true
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
