/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document, setTimeout */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

let HTTP_SERVER_LAG = 500;
let isDirty = false;

document.querySelector( '#snippet-manual-lag' ).addEventListener( 'change', evt => {
	HTTP_SERVER_LAG = evt.target.value;
} );

ClassicEditor
	.create( document.querySelector( '#snippet-manual' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			viewportTopOffset: 60
		}
	} )
	.then( editor => {
		window.editor = editor;

		handleStatusChanges( editor );
		handleSaveButton( editor );
		handleBeforeunload( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

// Handle clicking the "Save" button.
function handleSaveButton( editor ) {
	const saveButton = document.querySelector( '#snippet-manual-save' );
	const pendingActions = editor.plugins.get( 'PendingActions' );

	saveButton.addEventListener( 'click', evt => {
		const data = editor.getData();
		const action = pendingActions.add( 'Saving in progress.' );

		evt.preventDefault();

		// Fake HTTP server's lag.
		setTimeout( () => {
			log( data );

			pendingActions.remove( action );

			// Reset isDirty only if data didn't change in the meantime.
			if ( data == editor.getData() ) {
				isDirty = false;
			}

			updateStatus( editor );
		}, HTTP_SERVER_LAG );
	} );
}

function handleStatusChanges( editor ) {
	const pendingActions = editor.plugins.get( 'PendingActions' );

	pendingActions.on( 'change:hasAny', () => updateStatus( editor ) );

	editor.model.document.on( 'change:data', () => {
		isDirty = true;

		updateStatus( editor );
	} );
}

function handleBeforeunload( editor ) {
	window.addEventListener( 'beforeunload', evt => {
		if ( editor.plugins.get( 'PendingActions' ).hasAny ) {
			evt.preventDefault();
		}
	} );
}

function updateStatus( editor ) {
	const saveButton = document.querySelector( '#snippet-manual-save' );

	if ( isDirty ) {
		saveButton.classList.add( 'active' );
	} else {
		saveButton.classList.remove( 'active' );
	}

	if ( editor.plugins.get( 'PendingActions' ).hasAny ) {
		document.querySelector( '#snippet-manual-save-console' ).classList.remove( 'received' );
		saveButton.value = 'Saving...';
		saveButton.classList.add( 'saving' );
	} else {
		saveButton.value = 'Save';
		saveButton.classList.remove( 'saving' );
	}
}

function log( msg ) {
	const console = document.querySelector( '#snippet-manual-save-console' );

	console.classList.add( 'received' );
	console.textContent = msg;
}
