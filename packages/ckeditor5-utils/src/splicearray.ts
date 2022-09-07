/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/splicearray
 */

/**
 * Function that splices Arrays and could be used instead of Array.prototype.splice as it results
 * into "Maximum call stack size exceeded" when dealing with very big number.
 *
 * @private
 * @param {Array} target Array to be spliced.
 * @param {Array} source Array of elements to be inserted to target.
 * @param {Number} start Index at which nodes should be inserted/removed.
 * @param {Number} count Number of items.
 * @param {Number} [chunkSize=10000] Chunk size of source array.
 *
 * 		spliceArray( [ 1, 2 ], [ 3, 4 ], 0, 0 );		// [ 3, 4, 1, 2]
 * 		spliceArray( [ 1, 2 ], [ 3, 4 ], 1, 1 );		// [ 1, 3, 4 ]
 * 		spliceArray( [ 1, 2 ], [ 3, 4 ], 1, 0 );		// [ 1, 3, 4, 2 ]
 * 		spliceArray( [ 1, 2 ], [ 3, 4 ], 2, 0 );		// [ 1, 2, 3, 4 ]
 * 		spliceArray( [ 1, 2 ], [], 0, 1 );				// [ 2 ]
 *
 */
export default function spliceArray<T>( target: Array<T>, source: Array<T>, start: number, count: number, chunkSize = 10000 ): Array<T> {
	target.splice( start, count );

	if ( source && source.length ) {
		for ( let idx = Math.floor( source.length / chunkSize ); idx >= 0; idx-- ) {
			const sourceChunk = source.slice( idx * chunkSize, ( idx + 1 ) * chunkSize );
			target.splice( start, 0, ...sourceChunk );
		}
	}

	return target;
}
