/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/nth
 */

/**
 * Returns `nth` (starts from `0` of course) item of the given `iterable`.
 *
 * If the iterable is a generator, then it consumes **all its items**.
 * If it's a normal iterator, then it consumes **all items up to the given index**.
 * Refer to the [Iterators and Generators](https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Iterators_and_Generators)
 * guide to learn differences between these interfaces.
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
