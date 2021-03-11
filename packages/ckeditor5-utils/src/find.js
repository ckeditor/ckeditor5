/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/find
 */

/**
 * Returns the first item of the given `iterable` that satisfies the provided testing function.
 *
 * @param {Iterable.<*>} iterable
 * @param {Function} testCallback
 * @returns {*}
 */
export default function find( iterable, testCallback ) {
	for ( const item of iterable ) {
		if ( testCallback( item ) ) {
			return item;
		}
	}

	return null;
}
