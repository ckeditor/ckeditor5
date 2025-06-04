/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset.js';
import CloudServices from '../../src/cloudservices.js';

import { TOKEN_URL, UPLOAD_URL } from '../_utils/cloud-services-config.js';
import CloudServicesCore from '../../src/cloudservicescore.js';

const output = document.getElementById( 'output' );
const requestOutput = document.getElementById( 'request' );

ClassicEditor
	.create( document.getElementById( 'editor' ), {
		image: { toolbar: [ 'toggleImageCaption', 'imageTextAlternative' ] },
		cloudServices: {
			tokenUrl: getToken,
			uploadUrl: UPLOAD_URL
		},
		plugins: [ ArticlePluginSet, CloudServices, CloudServicesCore ],
		toolbar: [ 'heading', '|', 'undo', 'redo' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		output.innerText = err.message;
		console.error( err.message );
	} );

function handleRequest( xhr, resolve, reject ) {
	requestOutput.innerHTML = `
		<div>XHR request: <pre class='xhr-data'></pre></div>
		<button class="resolve">Resolve with the xhr response</button>
		<button class="reject">Reject with an error</button>
	`;

	const xhrSpan = requestOutput.querySelector( '.xhr-data' );
	const xhrData = {
		status: xhr.status,
		response: xhr.response
	};
	xhrSpan.innerText = JSON.stringify( xhrData, null, 2 );

	const resolveButton = requestOutput.querySelector( '.resolve' );
	resolveButton.addEventListener( 'click', () => resolve( xhr.response ) );

	const rejectButton = requestOutput.querySelector( '.reject' );
	rejectButton.addEventListener( 'click', () => reject( new Error( 'Cannot download new token!' ) ) );
}

function getToken() {
	return new Promise( ( resolve, reject ) => {
		const xhr = new XMLHttpRequest();

		xhr.open( 'GET', TOKEN_URL );

		xhr.addEventListener( 'load', () => {
			handleRequest( xhr, resolve, reject );
		} );

		xhr.addEventListener( 'error', () => reject( new Error( 'Network Error' ) ) );
		xhr.addEventListener( 'abort', () => reject( new Error( 'Abort' ) ) );

		xhr.send();
	} ).then( response => {
		output.innerText = `Response: ${ response }`;

		return response;
	} );
}
