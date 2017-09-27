/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console, window, document, XMLHttpRequest */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import EasyImage from '../../src/easyimage';
import ArticlePluginSet from '@ckeditor/ckeditor5-core/tests/_utils/articlepluginset';

import uid from '@ckeditor/ckeditor5-utils/src/uid';

// WARNING: The URL below should not be used for any other purpose than Easy Image plugin development.
// Images uploaded using the testing token service may be deleted automatically at any moment.
// If you would like to try the Easy Image service, please wait until the official launch of Easy Image and sign up for a free trial.
// Images uploaded during the free trial will not be deleted for the whole trial period and additionally the trial service can be converted
// into a subscription at any moment, allowing you to preserve all uploaded images.
const CLOUD_SERVICE_TOKEN_URL = 'https://j2sns7jmy0.execute-api.eu-central-1.amazonaws.com/prod/token';
const CLOUD_SERVICE_UPLOAD_URL = 'https://files.cke-cs.com/upload/';

getToken( { id: uid() } )
	.then( token => {
		return ClassicEditor
			.create( document.querySelector( '#editor' ), {
				cloudServices: {
					token,
					uploadUrl: CLOUD_SERVICE_UPLOAD_URL
				},
				plugins: [ ArticlePluginSet, EasyImage ],
				toolbar: [ 'headings', 'undo', 'redo', 'insertImage' ],
				image: {
					toolbar: [ 'imageStyleFull', 'imageStyleSide', '|', 'imageTextAlternative' ]
				}
			} )
			.then( editor => {
				window.editor = editor;
			} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function getToken( user ) {
	return new Promise( ( resolve, reject ) => {
		const xhr = new XMLHttpRequest();

		xhr.open( 'GET', `${ CLOUD_SERVICE_TOKEN_URL }?user.id=${ user.id }` );

		xhr.onload = () => {
			if ( xhr.status >= 200 && xhr.status < 300 ) {
				const response = JSON.parse( xhr.responseText );

				resolve( response.token );
			} else {
				reject( new Error( `XHR status: ${ xhr.status }` ) );
			}
		};

		xhr.onerror = err => {
			reject( err );
		};

		xhr.send( null );
	} );
}
