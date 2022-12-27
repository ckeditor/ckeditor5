/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/splicearray
 */

const BIG_CHUNK_SIZE = 10000;

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
export default function spliceArray<T>( target: Array<T>, source: Array<T>, start: number, count: number ): Array<T> {
	// In case of performance problems, see: https://github.com/ckeditor/ckeditor5/pull/12429/files#r965850568
	if ( Math.max( source.length, target.length ) > BIG_CHUNK_SIZE ) {
		return target.slice( 0, start ).concat( source ).concat( target.slice( start + count, target.length ) );
	} else {
		const newTarget = Array.from( target );
		newTarget.splice( start, count, ...source );

		return newTarget;
	}
}
