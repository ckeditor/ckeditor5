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
import { TableScroll } from '../../src/tablescroll.js';
import { GeneralHtmlSupport } from '@ckeditor/ckeditor5-html-support';

const editorConfig = {
	image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
	plugins: [
		ArticlePluginSet,
		Table,
		TableToolbar,
		TableSelection,
		TableClipboard,
		TableScroll,
		GeneralHtmlSupport
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
			'mergeTableCells'
		]
	},
	htmlSupport: {
		allow: [
			{
				name: /^.*$/,
				styles: true,
				attributes: true,
				classes: true
			}
		]
	}
};

MultiRootEditor
	.create( {
		roots: {
			main: { element: document.querySelector( '#main' ) },
			sidebar: { element: document.querySelector( '#sidebar' ) }
		},
		...editorConfig
	} )
	.then( editor => {
		window.editor = editor;

		document.querySelector( '#toolbar-container' ).appendChild( editor.ui.view.toolbar.element );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

document.querySelectorAll( '.root-width-apply' ).forEach( button => {
	button.addEventListener( 'click', () => {
		const rootName = button.dataset.root;
		const input = document.querySelector( `.root-width-input[data-root="${ rootName }"]` );
		const wrapper = document.querySelector( `.root-wrapper[data-root="${ rootName }"]` );

		wrapper.style.width = `${ input.value }px`;
	} );
} );

document.querySelectorAll( '.root-width-input' ).forEach( input => {
	input.addEventListener( 'keydown', event => {
		if ( event.key === 'Enter' ) {
			document.querySelector( `.root-width-apply[data-root="${ input.dataset.root }"]` ).click();
		}
	} );
} );

document.querySelectorAll( '.root-wrapper' ).forEach( wrapper => {
	const input = document.querySelector( `.root-width-input[data-root="${ wrapper.dataset.root }"]` );

	new ResizeObserver( entries => {
		for ( const entry of entries ) {
			input.value = Math.round( entry.contentRect.width );
		}
	} ).observe( wrapper );
} );
