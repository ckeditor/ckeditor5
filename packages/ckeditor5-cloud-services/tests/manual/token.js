/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document, XMLHttpRequest */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import CloudServices from '@ckeditor/ckeditor5-cloud-services/src/cloudservices';

import { TOKEN_URL, UPLOAD_URL } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

const output = document.querySelector( '#output' );
const refreshTokenButton = document.querySelector( '#refresh-token' );

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		cloudServices: {
			tokenUrl: getToken,
			uploadUrl: UPLOAD_URL
		},
		plugins: [ ArticlePluginSet, CloudServices ],
		toolbar: [ 'heading', '|', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;

		const cloudServices = editor.plugins.get( CloudServices );

		refreshTokenButton.addEventListener( 'click', () => {
			cloudServices.token._refreshToken();
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

window.addEventListener( refreshTokenButton, () => {} );

function getToken() {
	return new Promise( ( resolve, reject ) => {
		const xhr = new XMLHttpRequest();

		xhr.open( 'GET', TOKEN_URL );

		xhr.addEventListener( 'load', () => {
			const statusCode = xhr.status;
			const xhrResponse = xhr.response;

			if ( statusCode < 200 || statusCode > 299 ) {
				return reject( new Error( 'Cannot download new token!' ) );
			}

			return resolve( xhrResponse );
		} );

		xhr.addEventListener( 'error', () => reject( new Error( 'Network Error' ) ) );
		xhr.addEventListener( 'abort', () => reject( new Error( 'Abort' ) ) );

		xhr.send();
	} ).then( response => {
		log( 'Token: ' + response );

		return response;
	} );
}

function log( message ) {
	const pre = document.createElement( 'pre' );
	pre.innerText = message;

	output.appendChild( pre );
}
