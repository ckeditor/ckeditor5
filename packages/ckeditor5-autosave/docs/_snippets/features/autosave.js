/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	CS_CONFIG,
	TOKEN_URL,
	getViewportTopOffsetConfig
} from '@snippets/index.js';
import { AutosaveEditor } from '@snippets/installation/getting-and-setting-data/build-autosave-source.js';

let HTTP_SERVER_LAG = 500;

document.querySelector( '#snippet-autosave-lag' ).addEventListener( 'change', evt => {
	HTTP_SERVER_LAG = evt.target.value;
} );

AutosaveEditor
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
				top: getViewportTopOffsetConfig()
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
