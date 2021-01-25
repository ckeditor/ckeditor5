/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/count
 */

/**
 * Returns the number of items return by the iterator.
 *
 *		count( [ 1, 2, 3, 4, 5 ] ); // 5;
 *
 * @param {Iterable.<*>} iterator Any iterator.
 * @returns {Number} Number of items returned by that iterator.
 */
export default function count( iterator ) {
	let count = 0;

	for ( const _ of iterator ) { // eslint-disable-line no-unused-vars
		count++;
	}

	return count;
}
