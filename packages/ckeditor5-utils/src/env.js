/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals navigator:false */

/**
 * @module utils/env
 */

const userAgent = navigator.userAgent.toLowerCase();

/**
 * A namespace containing environment and browser information.
 */
export default {
	/**
	 * Indicates that application is running on Macintosh.
	 *
	 * @member {Boolean}
	 */
	mac: isMac( userAgent )
};

/**
 * Checks if User Agent represented by the string is running on Macintosh.
 *
 * @function isMac
 * @param {String} userAgent **Lowercase** `navigator.userAgent` string.
 * @returns {Boolean} Whether User Agent is running on Macintosh or not.
 */
export function isMac( userAgent ) {
	return userAgent.indexOf( 'macintosh' ) > -1;
}
