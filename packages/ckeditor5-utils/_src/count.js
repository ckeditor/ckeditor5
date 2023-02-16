/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * This is just a temporary migration file, please ignore it. This will be removed after migration to TypeScript is complete.
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
