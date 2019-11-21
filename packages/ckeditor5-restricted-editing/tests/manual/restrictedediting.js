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

restrictedModeButton.addEventListener( 'change', handleModeChange );
standardModeButton.addEventListener( 'change', handleModeChange );

startStandardMode();

function handleModeChange( evt ) {
	if ( evt.target.value === 'standard' ) {
		startStandardMode();
	} else {
		startRestrictedMode();
	}
}

async function startStandardMode() {
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
}

async function startRestrictedMode() {
	await reloadEditor( {
		plugins: [ ArticlePluginSet, Table, RestrictedEditing ],
		toolbar: [ 'bold', 'italic', 'link', '|', 'restrictedEditing', '|', 'undo', 'redo' ]
	} );
}

async function reloadEditor( config ) {
	if ( window.editor ) {
		await window.editor.destroy();
	}

	window.editor = await ClassicEditor.create( document.querySelector( '#editor' ), config );
}
