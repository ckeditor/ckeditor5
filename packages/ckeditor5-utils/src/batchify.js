/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Creates a set of operations which need to be applied to the input in order to transform
 * it into the output. Can be used with strings or arrays.
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
 * in order to transform it into the output.
 */
export default function batchify( diff, output ) {
	const batch = [];
	let index = 0;
	let lastOperation;

	diff.forEach( change => {
		if ( change == 'EQUAL' ) {
			pushLast();

			index++;
		} else if ( change == 'INSERT' ) {
			if ( isContinuationOf( 'INSERT' ) ) {
				lastOperation.values.push( output[ index ] );
			} else {
				pushLast();

				lastOperation = {
					type: 'INSERT',
					index: index,
					values: [ output[ index ] ]
				};
			}

			index++;
		} else /* if ( change == 'DELETE' ) */ {
			if ( isContinuationOf( 'DELETE' ) ) {
				lastOperation.howMany++;
			} else {
				pushLast();

				lastOperation = {
					type: 'DELETE',
					index: index,
					howMany: 1
				};
			}
		}
	} );

	pushLast();

	return batch;

	function pushLast() {
		if ( lastOperation ) {
			batch.push( lastOperation );
			lastOperation = null;
		}
	}

	function isContinuationOf( expected ) {
		return lastOperation && lastOperation.type == expected;
	}
}
