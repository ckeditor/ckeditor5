/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals ClassicEditor, console, window, document, setTimeout */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

let HTTP_SERVER_LAG = 500;

document.querySelector( '#snippet-autosave-lag' ).addEventListener( 'change', evt => {
	HTTP_SERVER_LAG = evt.target.value;
} );

ClassicEditor
	.create( document.querySelector( '#snippet-autosave' ), {
		cloudServices: CS_CONFIG,
		toolbar: {
			viewportTopOffset: 60
		},
		autosave: {
			save( editor ) {
				return saveData( editor.getData() );
			}
		}
	} )
	.then( editor => {
		window.editor = editor;

		displayStatus( editor );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function saveData( data ) {
	return new Promise( resolve => {
		// Fake HTTP server's lag.
		setTimeout( () => {
			log( data );

			resolve();
		}, HTTP_SERVER_LAG );
	} );
}

function displayStatus( editor ) {
	const pendingActions = editor.plugins.get( 'PendingActions' );
	const statusIndicator = document.querySelector( '.snippet-autosave-status' );
	const console = document.querySelector( '#snippet-autosave-console' );

	pendingActions.on( 'change:hasAny', ( evt, propertyName, newValue ) => {
		if ( newValue ) {
			statusIndicator.classList.add( 'busy' );
			console.classList.remove( 'received' );
		} else {
			statusIndicator.classList.remove( 'busy' );
			console.classList.add( 'received' );
		}
	} );
}

function log( msg ) {
	const console = document.querySelector( '#snippet-autosave-console' );

	console.textContent = msg;
}
