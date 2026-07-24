/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { MultiRootEditor } from '@ckeditor/ckeditor5-editor-multi-root';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { Table } from '../../src/table.js';
import { TableToolbar } from '../../src/tabletoolbar.js';
import { TableSelection } from '../../src/tableselection.js';
import { TableClipboard } from '../../src/tableclipboard.js';
import { TableProperties } from '../../src/tableproperties.js';
import { TableCellProperties } from '../../src/tablecellproperties.js';
import { TableCaption } from '../../src/tablecaption.js';
import { TableColumnResize } from '../../src/tablecolumnresize.js';
import { TableScroll } from '../../src/tablescroll.js';
import { TableLayout } from '../../src/tablelayout.js';

declare global {
	interface Window { editor: any }
}

const editorConfig = {
	image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
	plugins: [
		ArticlePluginSet,
		Table,
		TableLayout,
		TableToolbar,
		TableSelection,
		TableClipboard,
		TableProperties,
		TableCellProperties,
		TableCaption,
		TableColumnResize,
		TableScroll
	],
	toolbar: [
		'heading', '|',
		'insertTable', 'insertTableLayout', '|',
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

MultiRootEditor
	.create( {
		roots: {
			main: { element: document.querySelector( '#main' ) as HTMLElement },
			sidebar: { element: document.querySelector( '#sidebar' ) as HTMLElement }
		},
		...editorConfig
	} )
	.then( editor => {
		window.editor = editor;

		document.querySelector( '#toolbar-container' )!.appendChild( editor.ui.view.toolbar.element! );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

document.querySelectorAll<HTMLElement>( '.root-width-apply' ).forEach( button => {
	button.addEventListener( 'click', () => {
		const rootName = button.dataset.root;
		const input = document.querySelector( `.root-width-input[data-root="${ rootName }"]` ) as HTMLInputElement;
		const wrapper = document.querySelector( `.root-wrapper[data-root="${ rootName }"]` ) as HTMLElement;

		wrapper.style.width = `${ input.value }px`;
	} );
} );

document.querySelectorAll<HTMLInputElement>( '.root-width-input' ).forEach( input => {
	input.addEventListener( 'keydown', event => {
		if ( event.key === 'Enter' ) {
			( document.querySelector( `.root-width-apply[data-root="${ input.dataset.root }"]` ) as HTMLElement ).click();
		}
	} );
} );

document.querySelectorAll<HTMLElement>( '.root-wrapper' ).forEach( wrapper => {
	const input: any = document.querySelector( `.root-width-input[data-root="${ wrapper.dataset.root }"]` );

	new ResizeObserver( entries => {
		for ( const entry of entries ) {
			input!.value = Math.round( entry.contentRect.width );
		}
	} ).observe( wrapper );
} );
