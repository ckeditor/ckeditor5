/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module adapter-ckfinder/utils
 */

const TOKEN_COOKIE_NAME = 'ckCsrfToken';
const TOKEN_LENGTH = 40;
const tokenCharset = 'abcdefghijklmnopqrstuvwxyz0123456789';

/**
 * Returns the CSRF token value. The value is a hash stored in `document.cookie`
 * under the `ckCsrfToken` key. The CSRF token can be used to secure the communication
 * between the web browser and the CKFinder server.
 */
export function getCsrfToken(): string {
	let token = getCookie( TOKEN_COOKIE_NAME );

	if ( !token || token.length != TOKEN_LENGTH ) {
		token = generateToken( TOKEN_LENGTH );
		setCookie( TOKEN_COOKIE_NAME, token );
	}

	return token;
}

/**
 * Returns the value of the cookie with a given name or `null` if the cookie is not found.
 */
export function getCookie( name: string ): string | null {
	name = name.toLowerCase();
	const parts = document.cookie.split( ';' );

	for ( const part of parts ) {
		const pair = part.split( '=' );
		const key = decodeURIComponent( pair[ 0 ].trim().toLowerCase() );

		if ( key === name ) {
			return decodeURIComponent( pair[ 1 ] );
		}
	}

	return null;
}

/**
 * Sets the value of the cookie with a given name.
 */
export function setCookie( name: string, value: string ): void {
	document.cookie = encodeURIComponent( name ) + '=' + encodeURIComponent( value ) + ';path=/';
}

/**
 * Generates the CSRF token with the given length.
 */
function generateToken( length: number ): string {
	let result = '';
	const randValues = new Uint8Array( length );

	window.crypto.getRandomValues( randValues );

	for ( let j = 0; j < randValues.length; j++ ) {
		const character = tokenCharset.charAt( randValues[ j ] % tokenCharset.length );
		result += Math.random() > 0.5 ? character.toUpperCase() : character;
	}

	return result;
}
