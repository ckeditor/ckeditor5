/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import langUtils from '../lib/lodash/lang.js';

/**
 * Attributes can store any additional information for nodes in the data model.
 *
 * @class treeModel.Attribute
 */
export default class Attribute {
	/**
	 * Creates a new instance of the `Attribute` class. Once attribute is created it is immutable.
	 *
	 * @param {String} key Attribute key.
	 * @param {*} value Attribute value.
	 * @constructor
	 */
	constructor( key, value ) {
		/**
		 * Attribute key.
		 *
		 * @readonly
		 * @property {String} key
		 */
		this.key = key;

		/**
		 * Attribute value. Note that value may be any type, including objects.
		 *
		 * @readonly
		 * @property {*} value
		 */
		this.value = value;

		/**
		 * Attribute hash. Used to compare attributes. Two attributes with the same key and value will have the same hash.
		 *
		 * @readonly
		 * @private
		 * @property {String} _hash
		 */
		this._hash = this.key + ': ' + JSON.stringify( this.value, sort );

		// We do not care about the order, so collections with the same elements should return the same hash.
		function sort( key, value ) {
			if ( !langUtils.isArray( value ) && langUtils.isObject( value ) ) {
				const sorted = {};

				// Sort keys and fill up the sorted object.
				Object.keys( value ).sort().forEach( ( key ) => {
					sorted[ key ] = value[ key ];
				} );

				return sorted;
			} else {
				return value;
			}
		}
	}

	/**
	 * Compares two attributes. Returns `true` if two attributes have the same key and value even if the order of keys
	 * in the value object is different.
	 *
	 *		let attr1 = new Attribute( 'foo', { a: 1, b: 2 } );
	 *		let attr2 = new Attribute( 'foo', { b: 2, a: 1 } );
	 *		attr1.isEqual( attr2 ); // true
	 *
	 * @param {treeModel.Attribute} otherAttr Attribute to compare with.
	 * @returns {Boolean} True if attributes are equal to each other.
	 */
	isEqual( otherAttr ) {
		return this._hash === otherAttr._hash;
	}
}
