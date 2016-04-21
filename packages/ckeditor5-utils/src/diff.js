/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

// The following code is based on the "O(NP) Sequence Comparison Algorithm"
// by Sun Wu, Udi Manber, Gene Myers, Webb Miller.

/**
 * Calculates the difference between two arrays producing an object containing a list of actions
 * necessary to transform one array into another.
 *
 *		diff( 'aba', 'acca' ); // [ EQUAL, INSERT, INSERT, DELETE, EQUAL ]
 *
 * @method utils.diff
 * @param {Array} a Input array.
 * @param {Array} b Output array.
 * @param {Function} [cmp] Optional function used to compare array values, by default === is used.
 * @return {Array} Array of actions.
 */
 export default function diff( a, b, cmp ) {
	// Set the comparator function.
	cmp = cmp || function( a, b ) {
			return a === b;
		};

	// Temporary action type statics.
	let _INSERT, _DELETE;

	// Swapped the arrays to use the shorter one as the first one.
	if ( b.length < a.length ) {
		let tmp = a;

		a = b;
		b = tmp;

		// We swap the action types as well.
		_INSERT = 'DELETE';
		_DELETE = 'INSERT';
	} else {
		_INSERT = 'INSERT';
		_DELETE = 'DELETE';
	}

	const m = a.length;
	const n = b.length;
	const delta = n - m;

	// Edit scripts, for each diagonal.
	const es = {};
	// Furthest points, the furthest y we can get on each diagonal.
	const fp = {};

	function snake( k ) {
		// We use -1 as an alternative below to handle initial values ( instead of filling the fp with -1 first ).
		// Furthest points (y) on the diagonal below k.
		const y1 = ( fp[ k - 1 ] !== undefined ? fp[ k - 1 ] : -1 ) + 1;
		// Furthest points (y) on the diagonal above k.
		const y2 = fp[ k + 1 ] !== undefined ? fp[ k + 1 ] : -1;
		// The way we should go to get further.
		const dir = y1 > y2 ? -1 : 1;

		// Clone previous actions array (if any).
		if ( es[ k + dir ] ) {
			es[ k ] = es[ k + dir ].slice( 0 );
		}

		// Create actions array.
		if ( !es[ k ] ) {
			es[ k ] = [];
		}

		// Push the action.
		es[ k ].push( y1 > y2 ? _INSERT : _DELETE );

		// Set the beginning coordinates.
		let y = Math.max( y1, y2 );
		let x = y - k;

		// Traverse the diagonal as long as the values match.
		while ( x < m && y < n && cmp( a[ x ], b[ y ] ) ) {
			x++;
			y++;
			// Push no change action.
			es[ k ].push( 'EQUAL' );
		}

		return y;
	}

	let p = 0;
	let k;

	// Traverse the graph until we reach the end of the longer string.
	do {
		// Updates furthest points and edit scripts for diagonals below delta.
		for ( k = -p; k < delta; k++ ) {
			fp[ k ] = snake( k );
		}

		// Updates furthest points and edit scripts for diagonals above delta.
		for ( k = delta + p; k > delta; k-- ) {
			fp[ k ] = snake( k );
		}

		// Updates furthest point and edit script for the delta diagonal.
		// note that the delta diagonal is the one which goes through the sink (m, n).
		fp[ delta ] = snake( delta );

		p++;
	} while ( fp[ delta ] !== n );

	// Return the final list of edit actions.
	// We remove the first item that represents the action for the injected nulls.
	return es[ delta ].slice( 1 );
}
