/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Creates set of operations which need to be applied to the input in order to transform
 * it to the output. Can be used with strings or arrays.
 *
 *		const input = Array.from( 'abc' );
 *		const output = Array.from( 'xaby' );
 *		const batch = batchify( diff( input, output ), output );
 *
 *		batch.forEach( operation => {
 *			if ( operation.type == 'INSERT' ) {
 *				input.splice( operation.index, 0, ...operation.values );
 *			} else if ( operation.type == 'DELETE' ) {
 *				input.splice( operation.index, operation.howMany );
 *			}
 *		} );
 *
 *		input.join( '' ) == output.join( '' ); // -> true
 *
 * @method utils.batchify
 * @param {Array.<'EQUAL'|'INSERT'|'DELETE'>} diff Result of {@link utils.diff}.
 * @param {String|Array} output The string or array which was passed as diff's output.
 * @returns {Array.<Object>} Set of operations (insert or delete) which need to be applied to the input
 * in order to transform it to the output.
 */
export default function batchify( diff, output ) {
	const batches = [];
	let left = 0;
	let right = 0;
	let lastOperation;

	diff.forEach( change => {
		if ( change == 'EQUAL' ) {
			pushLast();

			left++;
			right++;
		} else if ( change == 'INSERT' ) {
			if ( isContinuationOf( 'INSERT' ) ) {
				lastOperation.values.push( output[ right ] );
			} else {
				pushLast();

				lastOperation = {
					type: 'INSERT',
					index: left,
					values: [ output[ right ] ]
				};
			}

			left++;
			right++;
		} else /* if ( change == 'DELETE' ) */ {
			if ( isContinuationOf( 'DELETE' ) ) {
				lastOperation.howMany++;
			} else {
				pushLast();

				lastOperation = {
					type: 'DELETE',
					index: left,
					howMany: 1
				};
			}
		}
	} );

	pushLast();

	return batches;

	function pushLast() {
		if ( lastOperation ) {
			batches.push( lastOperation );
			lastOperation = null;
		}
	}

	function isContinuationOf( expected ) {
		return lastOperation && lastOperation.type == expected;
	}
}
