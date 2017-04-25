/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, document */

const TOKEN_COOKIE_NAME = 'ckCsrfToken';
const TOKEN_LENGTH = 40;
const tokenCharset = 'abcdefghijklmnopqrstuvwxyz0123456789';

export function getCSRFToken() {
	let token = getCookie( TOKEN_COOKIE_NAME );

	if ( !token || token.length != TOKEN_LENGTH ) {
		token = generateToken( TOKEN_LENGTH );
		setCookie( TOKEN_COOKIE_NAME, token );
	}

	return token;
}

export function getCookie( name ) {
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

export function setCookie( name, value ) {
	document.cookie = encodeURIComponent( name ) + '=' + encodeURIComponent( value ) + ';path=/';
}

export function generateToken( length ) {
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
