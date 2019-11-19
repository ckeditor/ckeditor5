/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import Table from '@ckeditor/ckeditor5-table/src/table';

import RestrictedEditingException from '../../src/restrictededitingexception';
import RestrictedEditing from '../../src/restrictedediting';

const restrictedModeButton = document.getElementById( 'mode-restricted' );
const standardModeButton = document.getElementById( 'mode-standard' );

enableSwitchToStandardMode();
enableSwitchToRestrictedMode();

function enableSwitchToRestrictedMode() {
	restrictedModeButton.removeAttribute( 'disabled' );
	restrictedModeButton.addEventListener( 'click', startRestrictedMode );
}

function enableSwitchToStandardMode() {
	standardModeButton.removeAttribute( 'disabled' );
	standardModeButton.addEventListener( 'click', startStandardMode );
}

async function startStandardMode() {
	standardModeButton.removeEventListener( 'click', startStandardMode );
	standardModeButton.setAttribute( 'disabled', 'disabled' );

	await reloadEditor( {
		plugins: [ ArticlePluginSet, Table, RestrictedEditingException ],
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

	enableSwitchToRestrictedMode();
}

async function startRestrictedMode() {
	restrictedModeButton.removeEventListener( 'click', startRestrictedMode );
	restrictedModeButton.setAttribute( 'disabled', 'disabled' );

	await reloadEditor( {
		plugins: [ ArticlePluginSet, Table, RestrictedEditing ],
		toolbar: [ 'bold', 'italic', 'link', '|', 'restrictedEditing', '|', 'undo', 'redo' ]
	} );

	enableSwitchToStandardMode();
}

async function reloadEditor( config ) {
	if ( window.editor ) {
		await window.editor.destroy();
	}

	window.editor = await ClassicEditor.create( document.querySelector( '#editor' ), config );
}
