/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals navigator:false */

/**
 * @module utils/env
 */

const userAgent = navigator.userAgent.toLowerCase();

/**
 * A namespace containing environment and browser information.
 *
 * @namespace
 */
const env = {
	/**
	 * Indicates that the application is running on Macintosh.
	 *
	 * @static
	 * @member {Boolean} module:utils/env~env#isMac
	 */
	isMac: isMac( userAgent ),

	/**
	 * Indicates that the application is running in Microsoft Edge.
	 *
	 * @static
	 * @member {Boolean} module:utils/env~env#isEdge
	 */
	isEdge: isEdge( userAgent ),

	/**
	 * Indicates that the application is running in Firefox (Gecko).
	 *
	 * @static
	 * @member {Boolean} module:utils/env~env#isEdge
	 */
	isGecko: isGecko( userAgent ),

	/**
	 * Indicates that the application is running in Safari.
	 *
	 * @static
	 * @member {Boolean} module:utils/env~env#isSafari
	 */
	isSafari: isSafari( userAgent )
};

export default env;

/**
 * Checks if User Agent represented by the string is running on Macintosh.
 *
 * @param {String} userAgent **Lowercase** `navigator.userAgent` string.
 * @returns {Boolean} Whether User Agent is running on Macintosh or not.
 */
export function isMac( userAgent ) {
	return userAgent.indexOf( 'macintosh' ) > -1;
}

/**
 * Checks if User Agent represented by the string is Microsoft Edge.
 *
 * @param {String} userAgent **Lowercase** `navigator.userAgent` string.
 * @returns {Boolean} Whether User Agent is Edge or not.
 */
export function isEdge( userAgent ) {
	return !!userAgent.match( /edge\/(\d+.?\d*)/ );
}

/**
 * Checks if User Agent represented by the string is Firefox (Gecko).
 *
 * @param {String} userAgent **Lowercase** `navigator.userAgent` string.
 * @returns {Boolean} Whether User Agent is Firefox or not.
 */
export function isGecko( userAgent ) {
	return !!userAgent.match( /gecko\/\d+/ );
}

/**
 * Checks if User Agent represented by the string is Safari.
 *
 * @param {String} userAgent **Lowercase** `navigator.userAgent` string.
 * @returns {Boolean} Whether User Agent is Safari or not.
 */
export function isSafari( userAgent ) {
	return userAgent.indexOf( ' applewebkit/' ) > -1 && userAgent.indexOf( 'chrome' ) === -1;
}
