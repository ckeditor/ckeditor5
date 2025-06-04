/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices.js';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert.js';
import TableToolbar from '@ckeditor/ckeditor5-table/src/tabletoolbar.js';

import StandardEditingMode from '../../src/standardeditingmode.js';
import RestrictedEditingMode from '../../src/restrictededitingmode.js';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';

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
		plugins: [ ArticlePluginSet, Table, EasyImage, ImageInsert, ImageUpload, CloudServices, StandardEditingMode ],
		toolbar: [
			'heading', '|', 'bold', 'italic', 'link', '|',
			'bulletedList', 'numberedList', 'blockQuote', 'insertTable', 'insertImage', '|',
			'restrictedEditingException', '|', 'undo', 'redo'
		],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ],
			insert: {
				type: 'auto'
			}
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		menuBar: {
			isVisible: true
		},
		cloudServices: CS_CONFIG,
		updateSourceElementOnDestroy: true
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
		plugins: [
			ArticlePluginSet, Table, TableToolbar, EasyImage, ImageInsert, ImageUpload, CloudServices, RestrictedEditingMode, MyPlugin
		],
		toolbar: [ 'bold', 'italic', 'link', 'insertImage', '|', 'restrictedEditing', '|', 'undo', 'redo' ],
		image: {
			insert: {
				type: 'inline'
			}
		},
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
			tableToolbar: [ 'bold', 'italic' ]
		},
		updateSourceElementOnDestroy: true,
		menuBar: {
			isVisible: true
		},
		restrictedEditing: {
			allowedCommands: [ 'imageInsert', 'imageUpload' ]
		},
		cloudServices: CS_CONFIG
	} );
}

async function reloadEditor( config ) {
	if ( window.editor ) {
		await window.editor.destroy();
	}

	window.editor = await ClassicEditor.create( document.querySelector( '#editor' ), config );
}
