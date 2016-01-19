/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * An index at which arrays differ. If arrays are same at all indexes, it represents how arrays are related.
 * In this case, possible values are: 'SAME', 'PREFIX' or 'EXTENSION'.
 *
 * @typedef {String|Number} utils.ArrayRelation
 */

const utils = {
	/**
	 * Creates a spy function (ala Sinon.js) that can be used to inspect call to it.
	 *
	 * The following are the present features:
	 *
	 *  * spy.called: property set to `true` if the function has been called at least once.
	 *
	 * @returns {Function} The spy function.
	 */
	spy() {
		return function spy() {
			spy.called = true;
		};
	},

	/**
	 * Returns a unique id. This id is a number (starting from 1) which will never get repeated on successive calls
	 * to this method.
	 *
	 * @returns {Number} A number representing the id.
	 */
	uid: ( () => {
		let next = 1;

		return () => {
			return next++;
		};
	} )(),

	/**
	 * Checks if value implements iterator interface.
	 *
	 * @param {*} value The value to check.
	 * @returns {Boolean} True if value implements iterator interface.
	 */
	isIterable( value ) {
		return !!( value && value[ Symbol.iterator ] );
	},

	/**
	 * Compares how given arrays relate to each other. One array can be: same as another array, prefix of another array
	 * or completely different. If arrays are different, first index at which they differ is returned. Otherwise,
	 * a flag specifying the relation is returned. Flags are negative numbers, so whenever a number >= 0 is returned
	 * it means that arrays differ.
	 *
	 *   compareArrays( [ 0, 2 ], [ 0, 2 ] ); // 'SAME'
	 *   compareArrays( [ 0, 2 ], [ 0, 2, 1 ] ); // 'PREFIX'
	 *   compareArrays( [ 0, 2 ], [ 0 ] ); // 'EXTENSION'
	 *   compareArrays( [ 0, 2 ], [ 1, 2 ] ); // 0
	 *   compareArrays( [ 0, 2 ], [ 0, 1 ] ); // 1
	 *
	 * @param {Array} a Array that is compared.
	 * @param {Array} b Array to compare with.
	 * @returns {utils.ArrayRelation} How array `a` is related to `b`.
	 */
	compareArrays( a, b ) {
		const minLen = Math.min( a.length, b.length );

		for ( let i = 0; i < minLen; i++ ) {
			if ( a[ i ] != b[ i ] ) {
				// The arrays are different.
				return i;
			}
		}

		// Both arrays were same at all points.
		if ( a.length == b.length ) {
			// If their length is also same, they are the same.
			return 'SAME';
		} else if ( a.length < b.length ) {
			// Compared array is shorter so it is a prefix of the other array.
			return 'PREFIX';
		} else {
			// Compared array is longer so it is an extension of the other array.
			return 'EXTENSION';
		}
	},

	/**
	 * Returns `nth` (starts from `0` of course) item of an `iterable`.
	 *
	 * @param {Number} index
	 * @param {Iterable.<*>} iterable
	 * @returns {*}
	 */
	nth( index, iterable ) {
		for ( let item of iterable ) {
			if ( index === 0 ) {
				return item;
			}
			index -= 1;
		}

		return null;
	},

	/**
	 * Copies enumerable properties from the objects given as 2nd+ parameters to the
	 * prototype of the base class.
	 *
	 *		class SpecificEditor extends utils.mix( Editor, SomeMixin1, SomeMixin2 ) {
	 *			...
	 *		}
	 *
	 * @param {Function} [baseClass] Class which prototype will be extended.
	 * @param {Object} [...mixins] Objects from which to get properties.
	 */
	mix( baseClass, ...mixins ) {
		mixins.forEach( ( mixin ) => {
			Object.keys( mixin ).forEach( ( key ) => {
				Object.defineProperty( baseClass.prototype, key, {
					enumerable: false,
					configurable: true,
					writable: true,
					value: mixin[ key ]
				} );
			} );
		} );
	}
};

export default utils;
