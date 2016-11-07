/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/count
 */

/**
 * Returns the number of items return by the iterator.
 *
 *		count( [ 1, 2, 3, 4, 5 ] ); // 5;
 *
 * @memberOf utils
 * @param {Iterable.<*>} iterator Any iterator.
 * @returns {Number} Number of items returned by that iterator.
 */
export default function count( iterator ) {
	let count = 0;

	for ( let _ of iterator ) { // jshint ignore:line
		count++;
	}

	return count;
}
