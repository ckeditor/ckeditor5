/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Table from '@ckeditor/ckeditor5-table/src/table';

import StandardEditingMode from '../../src/standardeditingmode';
import RestrictedEditingMode from '../../src/restrictededitingmode';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar';

const restrictedModeButton = document.getElementById( 'mode-restricted' );
const standardModeButton = document.getElementById( 'mode-standard' );

restrictedModeButton.addEventListener( 'change', handleModeChange );
standardModeButton.addEventListener( 'change', handleModeChange );

startMode( document.querySelector( 'input[name="mode"]:checked' ).value );

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
		plugins: [ ArticlePluginSet, Table, StandardEditingMode ],
		toolbar: [
			'heading', '|', 'bold', 'italic', 'link', '|',
			'bulletedList', 'numberedList', 'blockQuote', 'insertTable', '|',
			'restrictedEditingException', '|', 'undo', 'redo'
		],
		image: {
			toolbar: [ 'imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		}
	} );
}

// Functional form of a plugin - might be a class that extends `Plugin` as well.
function MyPlugin( editor ) {
	// This action must be done in the `afterInit()` method of your plugin.
	this.afterInit = () => {
		const restrictedEditingModeEditing = editor.plugins.get( 'RestrictedEditingModeEditing' );

		const commandsToEnable = [
			'insertTableRowAbove', 'insertTableRowBelow',
			'insertTableColumnRight', 'insertTableColumnLeft',
			'mergeTableCells'
		];

		// Enable (always) some commands in restricted editing mode.
		commandsToEnable.forEach( commandName => restrictedEditingModeEditing.enableCommand( commandName ) );
	};
}

async function startRestrictedEditingMode() {
	await reloadEditor( {
		plugins: [ ArticlePluginSet, Table, TableToolbar, RestrictedEditingMode, MyPlugin ],
		toolbar: [ 'bold', 'italic', 'link', '|', 'restrictedEditing', '|', 'undo', 'redo' ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
			tableToolbar: [ 'bold', 'italic' ]
		}
	} );
}

async function reloadEditor( config ) {
	if ( window.editor ) {
		await window.editor.destroy();
	}

	window.editor = await ClassicEditor.create( document.querySelector( '#editor' ), config );
}
