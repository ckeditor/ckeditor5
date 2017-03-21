/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/nth
 */

/**
 * Returns `nth` (starts from `0` of course) item of the given `iterable`.
 * Consumes all items of the generator.
 * Consumes all items up to the index of the iterator that doesn't implement the `return()` method, (e.g. Array Iterator).
 * It's necessary to implement the `return()` method to close the iterator after the return statement in the `nth` function is invoked.
 * @see http://www.ecma-international.org/ecma-262/7.0/#sec-iteratorclose.
 *
 * @param {Number} index
 * @param {Iterable.<*>} iterable
 * @returns {*}
 */
export default function nth( index, iterable ) {
	for ( const item of iterable ) {
		if ( index === 0 ) {
			return item;
		}
		index -= 1;
	}

	return null;
}
