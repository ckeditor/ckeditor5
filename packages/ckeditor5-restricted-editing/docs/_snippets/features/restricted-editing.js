/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import ClassicEditor from '@ckeditor/ckeditor5-build-classic/src/ckeditor';
import RestrictedEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/restrictededitingmode';
import StandardEditingMode from '@ckeditor/ckeditor5-restricted-editing/src/standardeditingmode';

import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Table from '@ckeditor/ckeditor5-table/src/table';

ClassicEditor.builtinPlugins.push(
	RestrictedEditingMode, StandardEditingMode, ArticlePluginSet, Table );

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
		toolbar: [
			'restrictedEditingException', '|', 'heading', '|', 'bold', 'italic', 'link', '|',
			'bulletedList', 'numberedList', 'blockQuote', 'insertTable', '|',
			'undo', 'redo'
		],
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
		}
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
		}
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
