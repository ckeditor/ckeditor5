/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/count
 */

/**
 * Returns the number of items return by the iterator.
 *
 * ```ts
 * count( [ 1, 2, 3, 4, 5 ] ); // 5;
 * ```
 *
 * @param iterable Any iterable.
 * @returns Number of items returned by that iterable.
 */
export default function count( iterable: Iterable<unknown> ): number {
	let count = 0;

	for ( const _ of iterable ) { // eslint-disable-line no-unused-vars
		count++;
	}

	return count;
}
