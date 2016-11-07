/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Returns a unique id. This id is a number (starting from 1) which will never get repeated on successive calls
 * to this method.
 *
 * @function
 * @memberOf utils
 * @returns {String} A string representing the id.
 */
export default () => {
	let uuid = 'e'; // Make sure that id does not start with number.

	for ( let i = 0; i < 8; i++ ) {
		uuid += Math.floor( ( 1 + Math.random() ) * 0x10000 ).toString( 16 ).substring( 1 );
	}

	return uuid;
};
