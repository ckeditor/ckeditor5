/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Returns `nth` (starts from `0` of course) item of an `iterable`.
 *
 * @memberOf utils
 * @param {Number} index
 * @param {Iterable.<*>} iterable
 * @returns {*}
 */
export default function nth( index, iterable ) {
	for ( let item of iterable ) {
		if ( index === 0 ) {
			return item;
		}
		index -= 1;
	}

	return null;
}
