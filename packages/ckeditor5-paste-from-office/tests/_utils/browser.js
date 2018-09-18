/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global navigator */

/**
 * Returns the name of the browser in which code is executed based on `window.navigator` object.
 *
 * @returns {String|null} Lowercase browser name or null if non-standard browser is used.
 */
export function getBrowserName() {
	const browsers = detectBrowsers( navigator );

	const browser = Object.keys( browsers ).filter( browserName => !!browsers[ browserName ] );

	return browser.length ? browser[ 0 ] : null;
}

// Checks if current browser is one of the predefined ones (Chrome, Edge, Firefox, IE, Safari).
//
// @param {Navigator} navigator Browser `window.navigator` object on which detection is based.
// @returns {{chrome: Boolean, edge: Boolean, firefox: Boolean, ie: Boolean, safari: Boolean}}
function detectBrowsers( navigator ) {
	const agent = navigator.userAgent.toLowerCase();
	const edge = agent.match( /edge[ /](\d+.?\d*)/ );
	const trident = agent.indexOf( 'trident/' ) > -1;
	const ie = !!( edge || trident );
	const webkit = !ie && ( agent.indexOf( ' applewebkit/' ) > -1 );
	const gecko = navigator.product === 'Gecko' && !webkit && !ie;
	const chrome = webkit && agent.indexOf( 'chrome' ) > -1;

	return {
		chrome,
		edge: !!edge,
		firefox: gecko,
		ie,
		safari: webkit && !chrome,
	};
}
