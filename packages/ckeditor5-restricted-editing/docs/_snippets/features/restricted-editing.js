/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import { StandardEditingMode, RestrictedEditingMode } from '@ckeditor/ckeditor5-restricted-editing';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

// Umberto combines all `packages/*/docs` into the `docs/` directory. The import path must be valid after merging all directories.
import ClassicEditor from '../build-classic';

ClassicEditor.builtinPlugins.push( RestrictedEditingMode, StandardEditingMode, ArticlePluginSet );

const restrictedModeButton = document.getElementById( 'mode-restricted' );
const standardModeButton = document.getElementById( 'mode-standard' );

restrictedModeButton.addEventListener( 'change', handleModeChange );
standardModeButton.addEventListener( 'change', handleModeChange );

startMode( document.querySelector( 'input[name="editor-restriction-mode"]:checked' ).value );

async function handleModeChange( evt ) {
	await startMode( evt.target.value );
}

async function startMode( selectedMode ) {
	if ( selectedMode === 'standard' ) {
		await startStandardEditingMode();
	} else {
		await startRestrictedEditingMode();
	}
}

async function startStandardEditingMode() {
	await reloadEditor( {
		removePlugins: [ 'RestrictedEditingMode' ],
		toolbar: {
			items: [
				'undo', 'redo', '|', 'heading',
				'|', 'bold', 'italic',
				'|', 'link', 'uploadImage', 'insertTable', 'restrictedEditingException', 'mediaEmbed',
				'|', 'bulletedList', 'numberedList', 'outdent', 'indent'
			]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		updateSourceElementOnDestroy: true
	} );
}

async function startRestrictedEditingMode() {
	await reloadEditor( {
		removePlugins: [ 'StandardEditingMode' ],
		toolbar: [ 'restrictedEditing', '|', 'bold', 'italic', 'link', '|', 'undo', 'redo' ],
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		updateSourceElementOnDestroy: true
	} );
}

async function reloadEditor( config ) {
	if ( window.editor ) {
		await window.editor.destroy();
	}

	window.editor = await ClassicEditor.create( document.querySelector( '#restricted-editing-editor' ), config );

	window.attachTourBalloon( {
		target: window.findToolbarItem(
			window.editor.ui.view.toolbar,
			item => item.label && [ 'Enable editing', 'Disable editing' ].includes( item.label )
		),
		text: 'Click to add or remove editable regions.',
		editor: window.editor,
		tippyOptions: {
			placement: 'bottom-start'
		}
	} );
}
