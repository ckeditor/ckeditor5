/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * This is the additional demo snippet.
 * The base snippet sits in the /_snippets/installation/getting-and-setting-data folder.
 * This is due to legacy reasons.
 */

/* globals ClassicEditor, console, window, document, setTimeout */

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config.js';
import { TOKEN_URL } from '@ckeditor/ckeditor5-ckbox/tests/_utils/ckbox-config.js';

let HTTP_SERVER_LAG = 500;

document.querySelector( '#snippet-autosave-lag' ).addEventListener( 'change', evt => {
	HTTP_SERVER_LAG = evt.target.value;
} );

ClassicEditor
	.create( document.querySelector( '#snippet-autosave' ), {
		cloudServices: CS_CONFIG,
		image: {
			toolbar: [
				'imageStyle:inline', 'imageStyle:block', 'imageStyle:wrapText', '|',
				'toggleImageCaption', 'imageTextAlternative', 'ckboxImageEdit'
			]
		},
		ui: {
			viewportOffset: {
				top: window.getViewportTopOffsetConfig()
			}
		},
		ckbox: {
			tokenUrl: TOKEN_URL,
			allowExternalImagesEditing: [ /^data:/, 'origin', /ckbox/ ]
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
			updateServerDataConsole( data );

			resolve();
		}, HTTP_SERVER_LAG );
	} );
}

function displayStatus( editor ) {
	const pendingActions = editor.plugins.get( 'PendingActions' );
	const statusIndicator = document.querySelector( '#snippet-autosave-status' );

	pendingActions.on( 'change:hasAny', ( evt, propertyName, newValue ) => {
		if ( newValue ) {
			statusIndicator.classList.add( 'busy' );
		} else {
			statusIndicator.classList.remove( 'busy' );
		}
	} );
}

let consoleUpdates = 0;

function updateServerDataConsole( msg ) {
	const console = document.querySelector( '#snippet-autosave-console' );

	consoleUpdates++;
	console.classList.add( 'updated' );
	console.textContent = msg;

	setTimeout( () => {
		if ( --consoleUpdates == 0 ) {
			console.classList.remove( 'updated' );
		}
	}, 500 );
}
