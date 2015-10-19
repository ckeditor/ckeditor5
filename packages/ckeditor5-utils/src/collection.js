/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Collections are ordered sets of models.
 *
 * See also {@link core/NamedCollection}.
 *
 * @class Collection
 * @mixins EventEmitter
 */

CKEDITOR.define( [ 'emittermixin', 'utils' ], function( EmitterMixin, utils ) {
	class Collection {
		/**
		 * Creates a new Collection instance.
		 *
		 * @constructor
		 */
		constructor() {
			/**
			 * The internal list of models in the collection.
			 *
			 * @property _models
			 * @private
			 */
			this._models = [];
		}

		/**
		 * The number of items available in the collection.
		 *
		 * @property length
		 */
		get length() {
			return this._models.length;
		}

		/**
		 * Adds an item into the collection.
		 *
		 * Note that this is an array-like collection, so the same item can be present more than once. This behavior is
		 * for performance purposes only and is not guaranteed to be kept in the same way in the future.
		 *
		 * @param {Model} model The item to be added.
		 */
		add( model ) {
			this._models.push( model );

			this.fire( 'add', model );
		}

		/**
		 * Gets one item from the collection.
		 *
		 * @param {Number} index The index to take the item from.
		 * @returns {Model} The requested item.
		 */
		get( index ) {
			var model = this._models[ index ];

			if ( !model ) {
				throw new Error( 'Index not found' );
			}

			return model;
		}

		/**
		 * Removes an item from the collection.
		 *
		 * @param {Model|Number} modelOrIndex Either the item itself or its index inside the collection.
		 * @returns {Model} The removed item.
		 */
		remove( modelOrIndex ) {
			// If a model has been passed, convert it to its index.
			if ( typeof modelOrIndex != 'number' ) {
				modelOrIndex = this._models.indexOf( modelOrIndex );

				if ( modelOrIndex == -1 ) {
					throw new Error( 'Model not found' );
				}
			}

			var removedModel = this._models.splice( modelOrIndex, 1 )[ 0 ];

			if ( !removedModel ) {
				throw new Error( 'Index not found' );
			}

			this.fire( 'remove', removedModel );

			return removedModel;
		}
	}

	utils.extend( Collection.prototype, EmitterMixin );

	return Collection;
} );

/**
 * Fired when an item is added to the collection.
 *
 * @event add
 * @param {Model} model The added item.
 */

/**
 * Fired when an item is removed from the collection.
 *
 * @event remove
 * @param {Model} model The removed item.
 */
