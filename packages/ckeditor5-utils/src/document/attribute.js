/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'utils' ], function( utils ) {
	/**
	 * Attributes can store any additional information for nodes in the data model.
	 *
	 * @class Attribute
	 */
	class Attribute {
		/**
		 * Create a new attribute class. Once attribute is created it should not be modified.
		 *
		 * @param {String} key Attribute key
		 * @param {Mixed} value Attribute value
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
			 * Attribute hash. Used to compare attribute. Two attributes with the same key and value will have the same hash.
			 *
			 * @readonly
			 * @private
			 * @property {String} _hash
			 */
			this._hash = JSON.stringify( this.key ) + ': ' + JSON.stringify( this.value, sort );

			// If attribute is registered the registered one should be returned.
			if ( Attribute._register[ this._hash ] ) {
				return Attribute._register[ this._hash ];
			}

			// We do no care about the order so collections with the same elements should return the same hash.
			function sort( key, value ) {
				if ( !utils.isArray( value ) && utils.isObject( value ) ) {
					var sorted = {};

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
		 * Compare two attributes. Returns true is two attributes have the same key and value even if the order of value
		 * elements is different.
		 *
		 *	var attr1 = new Attribute( 'foo', { a: 1, b: 2 } );
		 *	var attr2 = new Attribute( 'foo', { b: 2, a: 1 } );
		 *	attr1.isEqual( attr2 ); // true
		 *
		 * @param {document.Attribute} otherAttr other attribute
		 * @returns {Boolean} True if attributes equals.
		 */
		isEqual( otherAttr ) {
			return this._hash === otherAttr._hash;
		}

		/**
		 * To save memory common used attributes may be registered. If an attribute is registered the constructor will
		 * always return the same instance of this attribute.
		 *
		 * Note that attributes are registered globally.
		 *
		 *	var attr1 = Attribute.register( 'bold', true );
		 *	var attr2 = Attribute.register( 'bold', true );
		 *	var attr3 = new Attribute( 'bold', true );
		 *	attr1 === attr2 // true
		 *	attr1 === attr3 // true
		 *
		 * @static
		 * @param {String} key Attribute key
		 * @param {Mixed} value Attribute value
		 * @returns {document.Attribute} Registered attribute.
		 */
		static register( key, value ) {
			var attr = new Attribute( key, value );

			if ( this._register[ attr._hash ] ) {
				return this._register[ attr._hash ];
			} else {
				this._register[ attr._hash ] = attr;

				return attr;
			}
		}
	}

	/**
	 * Attribute register where all registered attributes are stored.
	 *
	 * @static
	 * @private
	 * @property {String} _hash
	 */
	Attribute._register = {};

	return Attribute;
} );