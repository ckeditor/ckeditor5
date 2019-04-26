/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/difftochanges
 */

/**
 * Creates a set of changes which need to be applied to the input in order to transform
 * it into the output. This function can be used with strings or arrays.
 *
 *		const input = Array.from( 'abc' );
 *		const output = Array.from( 'xaby' );
 *		const changes = diffToChanges( diff( input, output ), output );
 *
 *		changes.forEach( change => {
 *			if ( change.type == 'insert' ) {
 *				input.splice( change.index, 0, ...change.values );
 *			} else if ( change.type == 'delete' ) {
 *				input.splice( change.index, change.howMany );
 *			}
 *		} );
 *
 *		input.join( '' ) == output.join( '' ); // -> true
 *
 * @param {Array.<'equal'|'insert'|'delete'>} diff Result of {@link module:utils/diff~diff}.
 * @param {String|Array} output The string or array which was passed as diff's output.
 * @returns {Array.<Object>} Set of changes (insert or delete) which need to be applied to the input
 * in order to transform it into the output.
 */
export default function diffToChanges( diff, output ) {
	const changes = [];
	let index = 0;
	let lastOperation;

	diff.forEach( change => {
		if ( change == 'equal' ) {
			pushLast();

			index++;
		} else if ( change == 'insert' ) {
			if ( isContinuationOf( 'insert' ) ) {
				lastOperation.values.push( output[ index ] );
			} else {
				pushLast();

				lastOperation = {
					type: 'insert',
					index,
					values: [ output[ index ] ]
				};
			}

			index++;
		} else /* if ( change == 'delete' ) */ {
			if ( isContinuationOf( 'delete' ) ) {
				lastOperation.howMany++;
			} else {
				pushLast();

				lastOperation = {
					type: 'delete',
					index,
					howMany: 1
				};
			}
		}
	} );

	pushLast();

	return changes;

	function pushLast() {
		if ( lastOperation ) {
			changes.push( lastOperation );
			lastOperation = null;
		}
	}

	function isContinuationOf( expected ) {
		return lastOperation && lastOperation.type == expected;
	}
}
