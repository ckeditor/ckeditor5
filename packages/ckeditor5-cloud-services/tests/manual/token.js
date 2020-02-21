/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document, XMLHttpRequest */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';
import CloudServices from '../../src/cloudservices';

import { TOKEN_URL, UPLOAD_URL } from '../_utils/cloud-services-config';

const output = document.getElementById( 'output' );
const requestOutput = document.getElementById( 'request' );

ClassicEditor
	.create( document.getElementById( 'editor' ), {
		cloudServices: {
			tokenUrl: getToken,
			uploadUrl: UPLOAD_URL
		},
		plugins: [ ArticlePluginSet, CloudServices ],
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
