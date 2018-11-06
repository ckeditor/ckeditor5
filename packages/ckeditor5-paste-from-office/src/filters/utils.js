/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module paste-from-office/filters/utils
 */

/* globals btoa */

/**
 * Converts given HEX string to base64 representation.
 *
 * @param {String} hexString The HEX string to be converted.
 * @returns {String} Base64 representation of a given HEX string.
 */
export function convertHexToBase64( hexString ) {
	return btoa( hexString.match( /\w{2}/g ).map( char => {
		return String.fromCharCode( parseInt( char, 16 ) );
	} ).join( '' ) );
}
