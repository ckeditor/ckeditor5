/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/splicearray
 */

/**
 * Splices one array into another. To be used instead of `Array.prototype.splice` as the latter may
 * throw "Maximum call stack size exceeded" when passed huge number of items to insert.
 *
 * Note: in contrary to Array.splice, this function does not modify the original `target`.
 *
 * ```ts
 * spliceArray( [ 1, 2 ], [ 3, 4 ], 0, 0 );	// [ 3, 4, 1, 2 ]
 * spliceArray( [ 1, 2 ], [ 3, 4 ], 1, 1 );	// [ 1, 3, 4 ]
 * spliceArray( [ 1, 2 ], [ 3, 4 ], 1, 0 );	// [ 1, 3, 4, 2 ]
 * spliceArray( [ 1, 2 ], [ 3, 4 ], 2, 0 );	// [ 1, 2, 3, 4 ]
 * spliceArray( [ 1, 2 ], [],       0, 1 );	// [ 2 ]
 * ```
 *
 * @param target Array to be spliced.
 * @param source Array of elements to be inserted to target.
 * @param start Index at which nodes should be inserted/removed.
 * @param count Number of items.
 *
 * @returns New spliced array.
 */
export default function spliceArray<T>(
	target: ReadonlyArray<T>,
	source: ReadonlyArray<T>,
	start: number,
	count: number
): Array<T> {
	const targetLength = target.length;
	const sourceLength = source.length;
	const result = new Array<T>( targetLength - count + sourceLength );

	let i = 0;

	for ( ; i < start && i < targetLength; i++ ) {
		result[ i ] = target[ i ];
	}

	for ( let j = 0; j < sourceLength; j++, i++ ) {
		result[ i ] = source[ j ];
	}

	for ( let k = start + count; k < targetLength; k++, i++ ) {
		result[ i ] = target[ k ];
	}

	return result;
}
