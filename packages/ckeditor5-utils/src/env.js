/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals navigator:false */

import global from './dom/global';

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
	 * @type {Boolean}
	 */
	isMac: isMac( userAgent ),

	/**
	 * Indicates that the application is running in Firefox (Gecko).
	 *
	 * @static
	 * @type {Boolean}
	 */
	isGecko: isGecko( userAgent ),

	/**
	 * Indicates that the application is running in Safari.
	 *
	 * @static
	 * @type {Boolean}
	 */
	isSafari: isSafari( userAgent ),

	/**
	 * Indicates that the application is running on Android mobile device.
	 *
	 * @static
	 * @type {Boolean}
	 */
	isAndroid: isAndroid( userAgent ),

	/**
	 * Indicates that the application is running in a browser using the Blink engine.
	 *
	 * @static
	 * @type {Boolean}
	 */
	isBlink: isBlink( userAgent ),

	/**
	 * Environment features information.
	 *
	 * @memberOf module:utils/env~env
	 * @namespace
	 */
	features: {
		/**
		 * Indicates that the environment supports ES2018 Unicode property escapes — like `\p{P}` or `\p{L}`.
		 * More information about unicode properties might be found
		 * [in Unicode Standard Annex #44](https://www.unicode.org/reports/tr44/#GC_Values_Table).
		 *
		 * @type {Boolean}
		 */
		isRegExpUnicodePropertySupported: isRegExpUnicodePropertySupported(),

		/**
		 * Indicates that the environment supports at least [Input Events Level 1](https://www.w3.org/TR/input-events-1/)
		 * (that includes `input` and `beforeinput` events).
		 *
		 * @type {Boolean}
		 */
		areInputEventsLevel1Supported: areInputEventsLevel1Supported( global.window )
	}
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

/**
 * Checks if User Agent represented by the string is Android mobile device.
 *
 * @param {String} userAgent **Lowercase** `navigator.userAgent` string.
 * @returns {Boolean} Whether User Agent is Safari or not.
 */
export function isAndroid( userAgent ) {
	return userAgent.indexOf( 'android' ) > -1;
}

/**
 * Checks if User Agent represented by the string is Blink engine.
 *
 * @param {String} userAgent **Lowercase** `navigator.userAgent` string.
 * @returns {Boolean} Whether User Agent is Blink engine or not.
 */
export function isBlink( userAgent ) {
	// The Edge browser before switching to the Blink engine used to report itself as Chrome (and "Edge/")
	// but after switching to the Blink it replaced "Edge/" with "Edg/".
	return userAgent.indexOf( 'chrome/' ) > -1 && userAgent.indexOf( 'edge/' ) < 0;
}

/**
 * Checks if the current environment supports ES2018 Unicode properties like `\p{P}` or `\p{L}`.
 * More information about unicode properties might be found
 * [in Unicode Standard Annex #44](https://www.unicode.org/reports/tr44/#GC_Values_Table).
 *
 * @returns {Boolean}
 */
export function isRegExpUnicodePropertySupported() {
	let isSupported = false;

	// Feature detection for Unicode properties. Added in ES2018. Currently Firefox does not support it.
	// See https://github.com/ckeditor/ckeditor5-mention/issues/44#issuecomment-487002174.

	try {
		// Usage of regular expression literal cause error during build (ckeditor/ckeditor5-dev#534).
		isSupported = 'ć'.search( new RegExp( '[\\p{L}]', 'u' ) ) === 0;
	} catch ( error ) {
		// Firefox throws a SyntaxError when the group is unsupported.
	}

	return isSupported;
}

/**
 * Checks if the current environment supports at least [Input Events Level 1](https://www.w3.org/TR/input-events-1/)
 * (that includes `input` and `beforeinput` events).
 *
 * @param {Window} domWindow The DOM Window interface.
 * @returns {Boolean}
 */
export function areInputEventsLevel1Supported( domWindow ) {
	const inputEvent = new domWindow.InputEvent( 'input' );

	return ( 'inputType' in inputEvent ) && ( 'getTargetRanges' in inputEvent );
}
