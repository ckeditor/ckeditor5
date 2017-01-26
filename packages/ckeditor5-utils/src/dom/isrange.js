/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/dom/isrange
 */

/**
 * Checks if the object is a native DOM Range.
 *
 * @param {*} obj
 * @returns {Boolean}
 */
export default function isRange( obj ) {
	return Object.prototype.toString.apply( obj ) == '[object Range]';
}
