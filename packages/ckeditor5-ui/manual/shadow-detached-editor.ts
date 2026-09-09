/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { BlockToolbar, BalloonToolbar } from '@ckeditor/ckeditor5-ui';
import { FontColor, FontBackgroundColor } from '@ckeditor/ckeditor5-font';
import { TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';

import { createEditorDomRoot } from './_utils/shadow.js';

declare global {
	interface Window {
		editor: any;
		editorDomRoot: HTMLElement | ShadowRoot;
	}
}

const ATTACH_BUTTON = document.getElementById( 'attach-btn' ) as HTMLButtonElement;
const ATTACH_STATUS = document.getElementById( 'attach-status' )!;

// The root the editor is meant to be attached into, built empty: the editor is created detached and only inserted
// into it on demand. No `ui.overlayContainer` is configured here on purpose – this test is about the editor
// resolving the root it ends up in by itself, which a configured container would short-circuit.
const attachRoot = window.editorDomRoot = createEditorDomRoot( document.getElementById( 'mount' )! );

// Created from a data string with no source element, so the UI element starts outside the DOM and the body
// collection has nowhere to mount yet.
ClassicEditor
	.create( {
		root: {
			initialData: ( document.getElementById( 'editor-data' ) as HTMLElement ).innerHTML
		},
		plugins: [
			ArticlePluginSet,
			BlockToolbar, BalloonToolbar,
			FontColor, FontBackgroundColor,
			TableProperties, TableCellProperties,
			FindAndReplace
		],
		toolbar: [
			'heading',
			'|',
			'bold', 'italic', 'link', 'fontColor', 'fontBackgroundColor',
			'|',
			'bulletedList', 'numberedList', 'blockQuote', 'insertTable',
			'|',
			'undo', 'redo', 'findAndReplace'
		],
		blockToolbar: [ 'heading', '|', 'bulletedList', 'numberedList', '|', 'blockQuote', 'insertTable' ],
		balloonToolbar: [ 'bold', 'italic', 'link' ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ]
		},
		menuBar: {
			isVisible: true
		}
	} )
	.then( editor => {
		window.editor = editor;

		ATTACH_BUTTON.disabled = false;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

ATTACH_BUTTON.addEventListener( 'click', () => {
	attachRoot.appendChild( window.editor.ui.element );

	ATTACH_BUTTON.disabled = true;
	ATTACH_STATUS.textContent =
		'Editor inserted into the root. Select text to show the balloon toolbar – it has to appear there, styled.';
} );
