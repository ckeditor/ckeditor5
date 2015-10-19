/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Named collections are key => model maps.
 *
 * See also {@link core/Collection}.
 *
 * @class NamedCollection
 * @mixins EventEmitter
 */

CKEDITOR.define( [ 'emittermixin', 'ckeditorerror', 'utils' ], function( EmitterMixin, CKEditorError, utils ) {
	class NamedCollection {
		/**
		 * Creates a new NamedCollection instance.
		 *
		 * @constructor
		 */
		constructor() {
			/**
			 * The internal map of models in the collection.
			 *
			 * @property _models
			 * @private
			 */
			this._models = new Map();
		}

		/**
		 * The number of items available in the collection.
		 *
		 * @property length
		 */
		get length() {
			return this._models.size;
		}

		/**
		 * Adds an item into the collection.
		 *
		 * Throws exception if an item with this name already exists or if the item does not have a name.
		 *
		 * @param {Model} model The item to be added.
		 */
		add( model ) {
			var name = model.name;

			if ( !name || this._models.has( name ) ) {
				/**
				 * Model isn't named or such model already exists in this collection
				 *
				 * Thrown when:
				 *
				 * * Model without a name was given.
				 * * Model with this name already exists in the collection.
				 *
				 * @error namedcollection-add
				 * @param {String} name Name of the model.
				 */
				throw new CKEditorError(
					'namedcollection-add: Model isn\'t named or such model already exists in this collection',
					{ name: name }
				);
			}

			this._models.set( name, model );

			this.fire( 'add', model );
		}

		/**
		 * Gets one item from the collection.
		 *
		 * @param {String} name The name of the item to take.
		 * @returns {Model} The requested item or `null` if such item does not exist.
		 */
		get( name ) {
			return this._models.get( name ) || null;
		}

		/**
		 * Removes an item from the collection.
		 *
		 * @param {Model|String} modelOrName Either the item itself (it must have a `name` property)
		 * or its name inside the collection.
		 * @returns {Model} The removed item.
		 */
		remove( modelOrName ) {
			var nameGiven = typeof modelOrName == 'string';
			var name = nameGiven ? modelOrName : modelOrName.name;
			var model = this._models.get( name );

			if ( nameGiven ? !model : ( model !== modelOrName ) ) {
				/**
				 * Model not found or other model exists under its name.
				 *
				 * Thrown when:
				 *
				 * * a model without a name was given,
				 * * no model found when a name was given,
				 * * a model was given and it does not exist in the collection or some other model was found under its name.
				 *
				 * @error namedcollection-remove
				 * @param {String} name Name of the model to remove.
				 * @param {Model} model The model which was found under the given name.
				 */
				throw new CKEditorError(
					'namedcollection-remove: Model not found or other model exists under its name.',
					{ name: name, model: model }
				);
			}

			this._models.delete( name );

			this.fire( 'remove', model );

			return model;
		}

		/**
		 * Executes the callback for each model in the collection.
		 *
		 * @param {Function} callback
		 * @param {Model} callback.item
		 * @param {String} callback.name
		 */
		forEach( callback ) {
			this._models.forEach( callback );
		}
	}

	utils.extend( NamedCollection.prototype, EmitterMixin );

	return NamedCollection;
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
