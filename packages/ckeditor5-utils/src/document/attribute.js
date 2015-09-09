/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( function() {
	/**
	 * Linear data attribute. Attributes can store any additional information, its meaning is defined by the code which
	 * use the.
	 *
	 *
	 * Note that if two attributes has the same meaning the same `Attribute` instance should be used.
	 * To handle this use {@link document.AttributeFactory}.
	 *
	 * @class Attribute
	 */
	class Attribute {
		/**
		 * Create a new attribute class. Once attribute is created it should not be modified.
		 *
		 * @param {String} key Attribute key
		 * @param {Mixed} value Attribute value
		 */
		constructor( key, value ) {
			this.key = key;
			this.value = value;
		}

		/**
		 * Attribute key
		 *
		 * @readonly
		 * @property {String} key
		 */

		/**
		 * Attribute value
		 *
		 * @readonly
		 * @property {Mixed} value
		 */
	}

	return Attribute;
} );