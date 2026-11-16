/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { ArticlePluginSet } from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import { BlockToolbar, BalloonToolbar } from '@ckeditor/ckeditor5-ui';
import { TableProperties, TableCellProperties } from '@ckeditor/ckeditor5-table';
import { FindAndReplace } from '@ckeditor/ckeditor5-find-and-replace';
import { Mention } from '@ckeditor/ckeditor5-mention';

type OverlayMode = 'default' | 'dialog' | 'layer';

const DIALOG = document.getElementById( 'editor-dialog' ) as HTMLDialogElement;
const DIALOG_TITLE = document.getElementById( 'dialog-title' )!;
const EDITOR_MOUNT = document.getElementById( 'editor-mount' )!;
const OVERLAY_LAYER = DIALOG.querySelector( '.dialog-overlay-layer' ) as HTMLElement;
const EDITOR_DATA = document.getElementById( 'editor-data' ) as HTMLTemplateElement;

const MODE_TITLES: Record<OverlayMode, string> = {
	default: 'No ui.overlayContainer (default)',
	dialog: 'ui.overlayContainer: the <dialog> element',
	layer: 'ui.overlayContainer: a fixed layer inside the <dialog>'
};

// The editor is created anew each time the dialog opens and destroyed when it closes, so every mode starts clean.
let editorPromise: Promise<ClassicEditor> | null = null;

for ( const button of document.querySelectorAll<HTMLButtonElement>( '[data-overlay-mode]' ) ) {
	button.addEventListener( 'click', () => openEditorDialog( button.dataset.overlayMode as OverlayMode ) );
}

DIALOG.addEventListener( 'close', () => {
	editorPromise!
		.then( editor => {
			// Remove only this editor's source element, so an editor opened in the meantime stays in place.
			const sourceElement = editor.sourceElement!;

			return editor.destroy().then( () => sourceElement.remove() );
		} )
		.catch( err => {
			console.error( err );
		} );

	editorPromise = null;
} );

function openEditorDialog( mode: OverlayMode ) {
	const sourceElement = EDITOR_MOUNT.appendChild( document.createElement( 'div' ) );

	sourceElement.innerHTML = EDITOR_DATA.innerHTML;
	DIALOG_TITLE.textContent = MODE_TITLES[ mode ];
	DIALOG.showModal();

	editorPromise = ClassicEditor
		.create( {
			attachTo: sourceElement,
			plugins: [
				ArticlePluginSet,
				BlockToolbar, BalloonToolbar,
				TableProperties, TableCellProperties,
				FindAndReplace, Mention
			],
			toolbar: [
				'heading',
				'|',
				'bold', 'italic', 'link',
				'|',
				'bulletedList', 'numberedList', 'blockQuote', 'insertTable',
				'|',
				'undo', 'redo', 'findAndReplace'
			],
			blockToolbar: [ 'heading', '|', 'bulletedList', 'numberedList', '|', 'blockQuote', 'insertTable' ],
			balloonToolbar: [ 'bold', 'italic', 'link' ],
			image: {
				toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ]
			},
			table: {
				contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties' ]
			},
			mention: {
				feeds: [
					{ marker: '@', feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ] }
				]
			},
			menuBar: {
				isVisible: true
			},
			ui: {
				overlayContainer: getOverlayContainer( mode )
			}
		} )
		.then( editor => {
			window.editor = editor;

			return editor;
		} );

	editorPromise.catch( err => {
		console.error( err.stack );
	} );
}

function getOverlayContainer( mode: OverlayMode ): HTMLElement | undefined {
	if ( mode == 'dialog' ) {
		return DIALOG;
	}

	if ( mode == 'layer' ) {
		return OVERLAY_LAYER;
	}

	return undefined;
}
