/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, document, XMLHttpRequest, FormData */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';

// TODO: load it from config.
const TEMPORARY_UPLOAD_URL =
	'https://cksource.com/weuy2g4ryt278ywiue/core/connector/php/connector.php?command=QuickUpload&type=Files&responseType=json';
export default class CKFinderAdapter extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ FileRepository ];
	}

	init() {
		// Register CKFinderAdapter
		this.editor.plugins.get( FileRepository ).createAdapter = loader => new Adapter( loader, this.editor.t );
	}
}

class Adapter {
	constructor( loader, t ) {
		// Save Loader instance to update upload progress.
		this.loader = loader;

		this.t = t;
	}

	upload() {
		const loader = this.loader;
		const t = this.t;

		return new Promise( ( resolve, reject ) => {
			const xhr = this.xhr = new XMLHttpRequest();

			// Prepare request.
			xhr.open( 'POST', TEMPORARY_UPLOAD_URL, true );
			xhr.responseType = 'json';

			// Prepare listeners.
			// TODO: Move strings to language files.
			const genericError = t( 'Cannot upload file:' ) + loader.file.name + '.';
			xhr.addEventListener( 'error', () => reject( genericError ) );
			xhr.addEventListener( 'abort', () => reject() );
			xhr.addEventListener( 'load', () => {
				const response = xhr.response;

				if ( !response.uploaded ) {
					return reject( response.error && response.error.message ? response.error.message : genericError );
				}

				// Resolve promise with data from server.
				resolve( {
					original: response.url
				} );
			} );

			// Upload progress when it's supported.
			if ( xhr.upload ) {
				xhr.upload.addEventListener( 'progress', ( evt ) => {
					if ( evt.lengthComputable ) {
						loader.uploadTotal = evt.total;
						loader.uploaded = evt.loaded;
					}
				} );
			}

			// Prepare form data.
			const data = new FormData();
			data.append( 'upload', loader.file );
			data.append( 'ckCsrfToken', getCsrfToken() );

			// Send request.
			xhr.send( data );
		} );
	}

	abort() {
		if ( this.xhr ) {
			this.xhr.abort();
		}
	}
}

const TOKEN_COOKIE_NAME = 'ckCsrfToken';
const TOKEN_LENGTH = 40;
const tokenCharset = 'abcdefghijklmnopqrstuvwxyz0123456789';

function getCsrfToken() {
	let token = getCookie( TOKEN_COOKIE_NAME );

	if ( !token || token.length != TOKEN_LENGTH ) {
		token = generateToken( TOKEN_LENGTH );
		setCookie( TOKEN_COOKIE_NAME, token );
	}

	return token;
}

function getCookie( name ) {
	name = name.toLowerCase();
	const parts = document.cookie.split( ';' );
	let pair, key;

	for ( let i = 0; i < parts.length; i++ ) {
		pair = parts[ i ].split( '=' );
		key = decodeURIComponent( pair[ 0 ].trim().toLowerCase() );

		if ( key === name ) {
			return decodeURIComponent( pair.length > 1 ? pair[ 1 ] : '' );
		}
	}

	return null;
}

function setCookie( name, value ) {
	document.cookie = encodeURIComponent( name ) + '=' + encodeURIComponent( value ) + ';path=/';
}

function generateToken( length ) {
	let randValues = [];
	let result = '';

	if ( window.crypto && window.crypto.getRandomValues ) {
		randValues = new Uint8Array( length );
		window.crypto.getRandomValues( randValues );
	} else {
		for ( let i = 0; i < length; i++ ) {
			randValues.push( Math.floor( Math.random() * 256 ) );
		}
	}

	for ( let j = 0; j < randValues.length; j++ ) {
		let character = tokenCharset.charAt( randValues[ j ] % tokenCharset.length );
		result += Math.random() > 0.5 ? character.toUpperCase() : character;
	}

	return result;
}
