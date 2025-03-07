/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { AutosaveEditor } from './build-autosave-source.js';

let HTTP_SERVER_LAG = 500;
let isDirty = false;

document.querySelector( '#snippet-manualsave-lag' ).addEventListener( 'change', evt => {
	HTTP_SERVER_LAG = evt.target.value;
} );

AutosaveEditor
	.create( document.querySelector( '#snippet-manualsave' ), {
		cloudServices: CS_CONFIG,
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
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
	const saveButton = document.querySelector( '#snippet-manualsave-save' );
	const pendingActions = editor.plugins.get( 'PendingActions' );

	saveButton.addEventListener( 'click', evt => {
		const data = editor.getData();
		const action = pendingActions.add( 'Saving in progress.' );

		evt.preventDefault();

		// Fake HTTP server's lag.
		setTimeout( () => {
			updateServerDataConsole( data );

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
	const buttonContainer = document.querySelector( '#snippet-manualsave-container' );

	if ( isDirty ) {
		buttonContainer.classList.add( 'active' );
	} else {
		buttonContainer.classList.remove( 'active' );
	}

	if ( editor.plugins.get( 'PendingActions' ).hasAny ) {
		buttonContainer.classList.add( 'saving' );
	} else {
		buttonContainer.classList.remove( 'saving' );
	}
}

let consoleUpdates = 0;

function updateServerDataConsole( msg ) {
	const console = document.querySelector( '#snippet-manualsave-console' );

	consoleUpdates++;
	console.classList.add( 'updated' );
	console.textContent = msg;

	setTimeout( () => {
		if ( --consoleUpdates == 0 ) {
			console.classList.remove( 'updated' );
		}
	}, 500 );
}
