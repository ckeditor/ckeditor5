/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * The base MVC model class.
 *
 * @class Model
 * @extends BasicClass
 */

CKEDITOR.define( [ 'basicclass', 'utils' ], function( BasicClass, utils ) {
	var Model = BasicClass.extend( {
		/**
		 * Creates a new Model instance.
		 *
		 * @param {Object} [attributes] The model state attributes to be set during the instance creation.
		 * @param {Object} [properties] The properties to be appended to the instance during creation.
		 * @method constructor
		 */
		constructor: function Model( attributes, properties ) {
			/**
			 * The internal hash containing the model's state.
			 *
			 * @property _attributes
			 * @private
			 */
			Object.defineProperty( this, '_attributes', {
				value: {}
			} );

			// Extend this instance with the additional (out of state) properties.
			if ( properties ) {
				utils.extend( this, properties );
			}

			// Initialize the attributes.
			if ( attributes ) {
				this.set( attributes );
			}
		},

		/**
		 * Creates and sets the value of a model attribute of this object. This attribute will be part of the model
		 * state and will be observable.
		 *
		 * It accepts also a single object literal containing key/value pairs with attributes to be set.
		 *
		 * @param {String} name The attributes name.
		 * @param {*} value The attributes value.
		 */
		set: function( name, value ) {
			// If the first parameter is an Object, we gonna interact through its properties.
			if ( utils.isObject( name ) ) {
				Object.keys( name ).forEach( function( attr ) {
					this.set( attr, name[ attr ] );
				}, this );

				return;
			}

			Object.defineProperty( this, name, {
				enumerable: true,
				configurable: true,

				get: function() {
					return this._attributes[ name ];
				},

				set: function( value ) {
					var oldValue = this._attributes[ name ];

					if ( oldValue !== value ) {
						this._attributes[ name ] = value;
						this.fire( 'change', name, value, oldValue );
						this.fire( 'change:' + name, value, oldValue );
					}
				}
			} );

			this[ name ] = value;
		}
	} );

	return Model;
} );

/**
 * Fired when an attribute changed value.
 *
 * @event change
 * @param {String} name The attribute name.
 * @param {*} value The new attribute value.
 * @param {*} oldValue The previous attribute value.
 */

/**
 * Fired when an specific attribute changed value.
 *
 * @event change:{attribute}
 * @param {*} value The new attribute value.
 * @param {*} oldValue The previous attribute value.
 */
