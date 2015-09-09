/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( [ 'document/attribute', 'utils' ], function( Attribute, utils ) {
	/**
	 * Factory to use the same attribute for the same key-values pair, so common attributes use the same object instance.
	 *
	 * @class document.AttributeFactory
	 */
	class AttributeFactory {
		/**
		 * Creates new attribute factory.
		 */
		constructor() {
			this._stored = {};
		}

		/**
		 * Create a new attribute or return the one which already exists. Calling `create` with the same key and value
		 * the same object instance will be used. This methods should be used to get common attributes, like bold.
		 *
		 * @param {String} key Attribute key
		 * @param {Mixed} value Attribute value
		 * @returns {document.Attribute} New attribute or stored one.
		 */
		create( key, value ) {
			var hash = this._stringify( key, value );

			if ( !this._stored[ hash ] ) {
				this._stored[ hash ] = new Attribute( key, value );
			}

			return this._stored[ hash ];
		}

		/**
		 * Produce a string hash of an item.
		 *
		 * @private
		 *
		 * @param {String} key Attribute key
		 * @param {Mixed} value Attribute value
		 * @returns {document.Attribute} New attribute or stored one.
		 */
		_stringify( key, value ) {
			return JSON.stringify( key ) + ': ' + JSON.stringify( value, sort );

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
	}

	return AttributeFactory;
} );