/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { Alignment } from '@ckeditor/ckeditor5-alignment';

import {
	TableCellProperties,
	TableLayout,
	TableProperties
} from '../src/index.js';

declare global {
	interface Window { editor: any }
}

ClassicEditor
	.create( {
		attachTo: document.querySelector( '#editor' ) as HTMLElement,
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		plugins: [
			ArticlePluginSet, Alignment, TableProperties, TableCellProperties, TableLayout
		],
		toolbar: [
			'heading', '|',
			'insertTable', 'insertTableLayout', '|',
			'bold', 'italic', 'alignment', '|',
			'undo', 'redo'
		],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ],
			enableFooters: true
		}
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );
