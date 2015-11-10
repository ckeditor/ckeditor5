/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'utils' ], function( utils ) {
	/**
	 * Attributes can store any additional information for nodes in the data model.
	 *
	 * @class document.Attribute
	 */
	class Attribute {
		/**
		 * Creates a new instance of the `Attribute` class. Once attribute is created it is immutable.
		 *
		 * @param {String} key Attribute key.
		 * @param {Mixed} value Attribute value.
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
			 * @property {Mixed} value
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

			// If attribute is already registered the registered one should be returned.
			if ( Attribute._register[ this._hash ] ) {
				return Attribute._register[ this._hash ];
			}

			// We do not care about the order, so collections with the same elements should return the same hash.
			function sort( key, value ) {
				if ( !utils.isArray( value ) && utils.isObject( value ) ) {
					const sorted = {};

					// Sort keys and fill up the sorted object.
					Object.keys( value ).sort().forEach( function( key ) {
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
		 * @param {document.Attribute} otherAttr Attribute to compare with.
		 * @returns {Boolean} True if attributes are equal to each other.
		 */
		isEqual( otherAttr ) {
			return this._hash === otherAttr._hash;
		}

		/**
		 * To save memory, commonly used attributes may be registered. If an attribute is registered the constructor will
		 * always return the same instance of this attribute.
		 *
		 * Note that attributes are registered globally.
		 *
		 *		let attr1 = Attribute.register( 'bold', true );
		 *		let attr2 = Attribute.register( 'bold', true );
		 *		let attr3 = new Attribute( 'bold', true );
		 *		attr1 === attr2 // true
		 *		attr1 === attr3 // true
		 *
		 * @static
		 * @param {String} key Attribute key.
		 * @param {Mixed} value Attribute value.
		 * @returns {document.Attribute} Registered attribute.
		 */
		static register( key, value ) {
			const attr = new Attribute( key, value );

			if ( this._register[ attr._hash ] ) {
				return this._register[ attr._hash ];
			} else {
				this._register[ attr._hash ] = attr;

				return attr;
			}
		}
	}

	/**
	 * Register of attributes in which all registered attributes are stored.
	 *
	 * @static
	 * @private
	 * @property {String} _hash
	 */
	Attribute._register = {};

	return Attribute;
} );
