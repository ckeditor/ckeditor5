/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/splicearray
 */

/**
 * Splices one array into another. To be used instead of `Array.prototype.splice` for better
 * performance and because the latter may throw "Maximum call stack size exceeded" error when
 * passing huge number of items to insert.
 *
 * ```ts
 * spliceArray( [ 1, 2 ], [ 3, 4 ], 0 );	// [ 3, 4, 1, 2 ]
 * spliceArray( [ 1, 2 ], [ 3, 4 ], 1 );	// [ 1, 3, 4, 2 ]
 * spliceArray( [ 1, 2 ], [ 3, 4 ], 2 );	// [ 1, 2, 3, 4 ]
 * spliceArray( [ 1, 2 ], [],       0 );	// [ 1, 2 ]
 * ```
 *
 * @param targetArray Array to be spliced.
 * @param insertArray Array of elements to be inserted to target.
 * @param index Index at which nodes should be inserted.
 *
 * @returns New spliced array.
 */
export default function spliceArray<T>(
	targetArray: Array<T>,
	insertArray: Array<T>,
	index: number
): void {
	const originalLength = targetArray.length;
	const insertLength = insertArray.length;

	// Shift elements in the target array to make space for insertArray
	for ( let i = originalLength - 1; i >= index; i-- ) {
		targetArray[ i + insertLength ] = targetArray[ i ];
	}

	// Copy elements from insertArray into the target array
	for ( let i = 0; i < insertLength; i++ ) {
		targetArray[ index + i ] = insertArray[ i ];
	}
}
