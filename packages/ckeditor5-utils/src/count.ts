/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	for ( const _ of iterable ) {
		count++;
	}

	return count;
}
