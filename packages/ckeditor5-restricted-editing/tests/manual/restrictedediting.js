/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import Table from '@ckeditor/ckeditor5-table/src/table.js';

import StandardEditingMode from '../../src/standardeditingmode.js';
import RestrictedEditingMode from '../../src/restrictededitingmode.js';
import ImageInsert from '@ckeditor/ckeditor5-image/src/imageinsert.js';
import ImageInline from '@ckeditor/ckeditor5-image/src/imageinline.js';
import CKFinder from '@ckeditor/ckeditor5-ckfinder/src/ckfinder.js';
import CKFinderUploadAdapter from '@ckeditor/ckeditor5-adapter-ckfinder/src/uploadadapter.js';
import ImageUpload from '@ckeditor/ckeditor5-image/src/imageupload.js';
import { UploadAdapterMock } from '@ckeditor/ckeditor5-upload/tests/_utils/mocks.js';

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
		plugins: [ ArticlePluginSet, Table, StandardEditingMode, ImageInline, ImageInsert,
			CKFinder, CKFinderUploadAdapter ],
		toolbar: [
			'heading', '|', 'bold', 'italic', 'link', '|',
			'bulletedList', 'numberedList', 'blockQuote', 'insertTable', '|',
			'restrictedEditingException', '|', 'undo', 'redo', 'insertImage'
		],
		image: {
			toolbar: [ 'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|', 'imageTextAlternative' ]
		},
		table: {
			contentToolbar: [
				'tableColumn',
				'tableRow',
				'mergeTableCells'
			]
		},
		ckfinder: {
			// eslint-disable-next-line max-len
			uploadUrl: 'https://ckeditor.com/apps/ckfinder/3.5.0/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
		},
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
		plugins: [ ImageUpload, ArticlePluginSet, RestrictedEditingMode, MyPlugin,
			ImageInline, ImageInsert, CKFinderUploadAdapter, CKFinder, CKFinderUploadAdapter, Table ],
		toolbar: [ 'bold', 'italic', 'link', '|', 'restrictedEditing', '|', 'undo', 'redo', 'insertImage', 'insertTable' ],
		table: {
			contentToolbar: [ 'tableColumn', 'tableRow', 'mergeTableCells' ],
			tableToolbar: [ 'bold', 'italic' ]
		},
		image: {
			toolbar: [ 'imageStyle:inline' ]
		},
		restrictedEditing: {
			allowedCommands: [ 'imageInsert', 'imageUpload', 'insertTable' ]
		},
		ckfinder: {
			// eslint-disable-next-line max-len
			uploadUrl: 'https://ckeditor.com/apps/ckfinder/3.5.0/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json'
		},
		updateSourceElementOnDestroy: true
	} );
}

async function reloadEditor( config ) {
	if ( window.editor ) {
		await window.editor.destroy();
	}

	window.editor = await ClassicEditor.create( document.querySelector( '#editor' ), config );
	window.editor.plugins._plugins.delete( 'ImageBlockEditing' );

	window.editor.plugins.get( 'FileRepository' ).createUploadAdapter = loader => {
		const adapterMock = new UploadAdapterMock( loader );

		return adapterMock;
	};
}
