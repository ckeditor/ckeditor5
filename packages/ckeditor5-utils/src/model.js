/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * The base MVC model class.
 *
 * @class Model
 * @mixins EventEmitter
 */

CKEDITOR.define( [ 'emittermixin', 'ckeditorerror', 'utils' ], function( EmitterMixin, CKEditorError, utils ) {
	class Model {
		/**
		 * Creates a new Model instance.
		 *
		 * @param {Object} [attributes] The model state attributes to be set during the instance creation.
		 * @param {Object} [properties] The properties to be appended to the instance during creation.
		 * @method constructor
		 */
		constructor( attributes, properties ) {
			/**
			 * The internal hash containing the model's state.
			 *
			 * @property _attributes
			 * @private
			 */
			this._attributes = {};

			// Extend this instance with the additional (out of state) properties.
			if ( properties ) {
				utils.extend( this, properties );
			}

			// Initialize the attributes.
			if ( attributes ) {
				this.set( attributes );
			}
		}

		/**
		 * Creates and sets the value of a model attribute of this object. This attribute will be part of the model
		 * state and will be observable.
		 *
		 * It accepts also a single object literal containing key/value pairs with attributes to be set.
		 *
		 * This method throws the {@link model-set-cannot-override} error if the model instance already
		 * have a property with a given attribute name. This prevents from mistakenly overriding existing
		 * properties and methods, but means that `foo.set( 'bar', 1 )` may be slightly slower than `foo.bar = 1`.
		 *
		 * @param {String} name The attributes name.
		 * @param {*} value The attributes value.
		 */
		set( name, value ) {
			// If the first parameter is an Object, we gonna interact through its properties.
			if ( utils.isObject( name ) ) {
				Object.keys( name ).forEach( function( attr ) {
					this.set( attr, name[ attr ] );
				}, this );

				return;
			}

			if ( ( name in this ) && !( name in this._attributes ) ) {
				/**
				 * Cannot override an existing property.
				 *
				 * This error is thrown when trying to {@link Model#set set} an attribute with
				 * a name of an already existing property. For example:
				 *
				 *		let model = new Model();
				 *		model.property = 1;
				 *		model.set( 'property', 2 );		// throws
				 *
				 *		model.set( 'attr', 1 );
				 *		model.set( 'attr', 2 );			// ok, because this is an existing attribute.
				 *
				 * @error model-set-cannot-override
				 */
				throw new CKEditorError( 'model-set-cannot-override: Cannot override an existing property.' );
			}

			Object.defineProperty( this, name, {
				enumerable: true,
				configurable: true,

				get: function() {
					return this._attributes[ name ];
				},

				set: function( value ) {
					const oldValue = this._attributes[ name ];

					if ( oldValue !== value ) {
						this._attributes[ name ] = value;
						this.fire( 'change', name, value, oldValue );
						this.fire( 'change:' + name, value, oldValue );
					}
				}
			} );

			this[ name ] = value;
		}
	}

	utils.extend( Model.prototype, EmitterMixin );

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
