/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { DiffResult } from './diff';

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
 * @param {Array.<module:utils/diff~DiffResult>} diff Result of {@link module:utils/diff~diff}.
 * @param {String|Array} output The string or array which was passed as diff's output.
 * @returns {Array.<module:utils/difftochanges~Change>} Set of changes (insert or delete) which need to be applied to the input
 * in order to transform it into the output.
 */
export default function diffToChanges<T>( diff: ReadonlyArray<DiffResult>, output: ArrayLike<T> ): Array<Change<T>> {
	const changes: Array<Change<T>> = [];
	let index = 0;
	let lastOperation: Change<T> | null = null;

	diff.forEach( change => {
		if ( change == 'equal' ) {
			pushLast();

			index++;
		} else if ( change == 'insert' ) {
			if ( lastOperation && lastOperation.type == 'insert' ) {
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
			if ( lastOperation && lastOperation.type == 'delete' ) {
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
}

/**
 * An object describing insertion change.
 *
 * @typedef {Object} module:utils/difftochanges~InsertChange
 * @property {'insert'} type
 * @property {Number} index
 * @property {Array} values
 */
export interface InsertChange<T> {
	type: 'insert';
	index: number;
	values: Array<T>;
}

/**
 * An object describing deletion change.
 *
 * @typedef {Object} module:utils/difftochanges~DeleteChange
 * @property {'delete'} type
 * @property {Number} index
 * @property {Number} howMany
 */
export interface DeleteChange {
	type: 'delete';
	index: number;
	howMany: number;
}

/**
 * The element of the result of {@link module:utils/difftochanges~diffToChanges} function.
 *
 * @typedef {module:utils/difftochanges~InsertChange|module:utils/difftochanges~DeleteChange} module:utils/difftochanges~Change
 */
export type Change<T> = InsertChange<T> | DeleteChange;
