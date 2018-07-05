/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/dom/iswindow
 */

/**
 * Checks if the object is a native DOM Window.
 *
 * @param {*} obj
 * @returns {Boolean}
 */
export default function isWindow( obj ) {
	const stringifiedObject = Object.prototype.toString.apply( obj );

	return (
		// Returns `true` for the `window` object in browser environments.
		stringifiedObject == '[object Window]' ||

		// Returns `true` for the `window` object in the Electron environment.
		stringifiedObject == '[object global]'
	);
}
