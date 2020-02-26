/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/collection
 */

import EmitterMixin from './emittermixin';
import CKEditorError from './ckeditorerror';
import uid from './uid';
import isIterable from './isiterable';
import mix from './mix';

/**
 * Collections are ordered sets of objects. Items in the collection can be retrieved by their indexes
 * in the collection (like in an array) or by their ids.
 *
 * If an object without an `id` property is being added to the collection, the `id` property will be generated
 * automatically. Note that the automatically generated id is unique only within this single collection instance.
 *
 * By default an item in the collection is identified by its `id` property. The name of the identifier can be
 * configured through the constructor of the collection.
 *
 * @mixes module:utils/emittermixin~EmitterMixin
 */
export default class Collection {
	/**
	 * Creates a new Collection instance.
	 *
	 * You can provide an array of initial items the collection will be created with:
	 *
	 *		const collection = new Collection( [ { id: 'John' }, { id: 'Mike' } ] );
	 *
	 *		console.log( collection.get( 0 ) ); // -> { id: 'John' }
	 *		console.log( collection.get( 1 ) ); // -> { id: 'Mike' }
	 *		console.log( collection.get( 'Mike' ) ); // -> { id: 'Mike' }
	 *
	 * Or you can first create a collection and then add new items using the {@link #add} method:
	 *
	 *		const collection = new Collection();
	 *
	 *		collection.add( { id: 'John' } );
	 *		console.log( collection.get( 0 ) ); // -> { id: 'John' }
	 *
	 * Whatever option you choose, you can always pass a configuration object as the last argument
	 * of the constructor:
	 *
	 *		const emptyCollection = new Collection( { idProperty: 'name' } );
	 *		emptyCollection.add( { name: 'John' } );
	 *		console.log( collection.get( 'John' ) ); // -> { name: 'John' }
	 *
	 *		const nonEmptyCollection = new Collection( [ { name: 'John' } ], { idProperty: 'name' } );
	 *		nonEmptyCollection.add( { name: 'George' } );
	 *		console.log( collection.get( 'George' ) ); // -> { name: 'George' }
	 *
	 * @param {Iterable.<Object>|Object} initialItemsOrOptions The initial items of the collection or
	 * the options object.
	 * @param {Object} [options={}] The options object, when the first argument is an array of initial items.
	 * @param {String} [options.idProperty='id'] The name of the property which is used to identify an item.
	 * Items that do not have such a property will be assigned one when added to the collection.
	 */
	constructor( initialItemsOrOptions = {}, options = {} ) {
		const hasInitialItems = isIterable( initialItemsOrOptions );

		if ( !hasInitialItems ) {
			options = initialItemsOrOptions;
		}

		/**
		 * The internal list of items in the collection.
		 *
		 * @private
		 * @member {Object[]}
		 */
		this._items = [];

		/**
		 * The internal map of items in the collection.
		 *
		 * @private
		 * @member {Map}
		 */
		this._itemMap = new Map();

		/**
		 * The name of the property which is considered to identify an item.
		 *
		 * @private
		 * @member {String}
		 */
		this._idProperty = options.idProperty || 'id';

		/**
		 * A helper mapping external items of a bound collection ({@link #bindTo})
		 * and actual items of this collection. It provides information
		 * necessary to properly remove items bound to another collection.
		 *
		 * See {@link #_bindToInternalToExternalMap}.
		 *
		 * @protected
		 * @member {WeakMap}
		 */
		this._bindToExternalToInternalMap = new WeakMap();

		/**
		 * A helper mapping items of this collection to external items of a bound collection
		 * ({@link #bindTo}). It provides information necessary to manage the bindings, e.g.
		 * to avoid loops in two–way bindings.
		 *
		 * See {@link #_bindToExternalToInternalMap}.
		 *
		 * @protected
		 * @member {WeakMap}
		 */
		this._bindToInternalToExternalMap = new WeakMap();

		/**
		 * Stores indexes of skipped items from bound external collection.
		 *
		 * @private
		 * @member {Array}
		 */
		this._skippedIndexesFromExternal = [];

		// Set the initial content of the collection (if provided in the constructor).
		if ( hasInitialItems ) {
			for ( const item of initialItemsOrOptions ) {
				this._items.push( item );
				this._itemMap.set( this._getItemIdBeforeAdding( item ), item );
			}
		}

		/**
		 * A collection instance this collection is bound to as a result
		 * of calling {@link #bindTo} method.
		 *
		 * @protected
		 * @member {module:utils/collection~Collection} #_bindToCollection
		 */
	}

	/**
	 * The number of items available in the collection.
	 *
	 * @member {Number} #length
	 */
	get length() {
		return this._items.length;
	}

	/**
	 * Returns the first item from the collection or null when collection is empty.
	 *
	 * @returns {Object|null} The first item or `null` if collection is empty.
	 */
	get first() {
		return this._items[ 0 ] || null;
	}

	/**
	 * Returns the last item from the collection or null when collection is empty.
	 *
	 * @returns {Object|null} The last item or `null` if collection is empty.
	 */
	get last() {
		return this._items[ this.length - 1 ] || null;
	}

	/**
	 * Adds an item into the collection.
	 *
	 * If the item does not have an id, then it will be automatically generated and set on the item.
	 *
	 * @chainable
	 * @param {Object} item
	 * @param {Number} [index] The position of the item in the collection. The item
	 * is pushed to the collection when `index` not specified.
	 * @fires add
	 */
	add( item, index ) {
		let itemId;
		const idProperty = this._idProperty;

		if ( ( idProperty in item ) ) {
			itemId = item[ idProperty ];

			if ( typeof itemId != 'string' ) {
				/**
				 * This item's id should be a string.
				 *
				 * @error collection-add-invalid-id
				 */
				throw new CKEditorError( 'collection-add-invalid-id', this );
			}

			if ( this.get( itemId ) ) {
				/**
				 * This item already exists in the collection.
				 *
				 * @error collection-add-item-already-exists
				 */
				throw new CKEditorError( 'collection-add-item-already-exists', this );
			}
		} else {
			item[ idProperty ] = itemId = uid();
		}

		// TODO: Use ES6 default function argument.
		if ( index === undefined ) {
			index = this._items.length;
		} else if ( index > this._items.length || index < 0 ) {
			/**
			 * The index number has invalid value.
			 *
			 * @error collection-add-item-bad-index
			 */
			throw new CKEditorError( 'collection-add-item-invalid-index', this );
		}

		this._items.splice( index, 0, item );

		this._itemMap.set( itemId, item );

		this.fire( 'add', item, index );

		return this;
	}

	/**
	 * Gets item by its id or index.
	 *
	 * @param {String|Number} idOrIndex The item id or index in the collection.
	 * @returns {Object|null} The requested item or `null` if such item does not exist.
	 */
	get( idOrIndex ) {
		let item;

		if ( typeof idOrIndex == 'string' ) {
			item = this._itemMap.get( idOrIndex );
		} else if ( typeof idOrIndex == 'number' ) {
			item = this._items[ idOrIndex ];
		} else {
			/**
			 * Index or id must be given.
			 *
			 * @error collection-get-invalid-arg
			 */
			throw new CKEditorError( 'collection-get-invalid-arg: Index or id must be given.', this );
		}

		return item || null;
	}

	/**
	 * Returns a boolean indicating whether the collection contains an item.
	 *
	 * @param {Object|String} itemOrId The item or its id in the collection.
	 * @returns {Boolean} `true` if the collection contains the item, `false` otherwise.
	 */
	has( itemOrId ) {
		if ( typeof itemOrId == 'string' ) {
			return this._itemMap.has( itemOrId );
		} else { // Object
			const idProperty = this._idProperty;
			const id = itemOrId[ idProperty ];

			return this._itemMap.has( id );
		}
	}

	/**
	 * Gets index of item in the collection.
	 * When item is not defined in the collection then index will be equal -1.
	 *
	 * @param {Object|String} itemOrId The item or its id in the collection.
	 * @returns {Number} Index of given item.
	 */
	getIndex( itemOrId ) {
		let item;

		if ( typeof itemOrId == 'string' ) {
			item = this._itemMap.get( itemOrId );
		} else {
			item = itemOrId;
		}

		return this._items.indexOf( item );
	}

	/**
	 * Removes an item from the collection.
	 *
	 * @param {Object|Number|String} subject The item to remove, its id or index in the collection.
	 * @returns {Object} The removed item.
	 * @fires remove
	 */
	remove( subject ) {
		let index, id, item;
		let itemDoesNotExist = false;
		const idProperty = this._idProperty;

		if ( typeof subject == 'string' ) {
			id = subject;
			item = this._itemMap.get( id );
			itemDoesNotExist = !item;

			if ( item ) {
				index = this._items.indexOf( item );
			}
		} else if ( typeof subject == 'number' ) {
			index = subject;
			item = this._items[ index ];
			itemDoesNotExist = !item;

			if ( item ) {
				id = item[ idProperty ];
			}
		} else {
			item = subject;
			id = item[ idProperty ];
			index = this._items.indexOf( item );
			itemDoesNotExist = ( index == -1 || !this._itemMap.get( id ) );
		}

		if ( itemDoesNotExist ) {
			/**
			 * Item not found.
			 *
			 * @error collection-remove-404
			 */
			throw new CKEditorError( 'collection-remove-404: Item not found.', this );
		}

		this._items.splice( index, 1 );
		this._itemMap.delete( id );

		const externalItem = this._bindToInternalToExternalMap.get( item );
		this._bindToInternalToExternalMap.delete( item );
		this._bindToExternalToInternalMap.delete( externalItem );

		this.fire( 'remove', item, index );

		return item;
	}

	/**
	 * Executes the callback for each item in the collection and composes an array or values returned by this callback.
	 *
	 * @param {Function} callback
	 * @param {Object} callback.item
	 * @param {Number} callback.index
	 * @param {Object} ctx Context in which the `callback` will be called.
	 * @returns {Array} The result of mapping.
	 */
	map( callback, ctx ) {
		return this._items.map( callback, ctx );
	}

	/**
	 * Finds the first item in the collection for which the `callback` returns a true value.
	 *
	 * @param {Function} callback
	 * @param {Object} callback.item
	 * @param {Number} callback.index
	 * @param {Object} ctx Context in which the `callback` will be called.
	 * @returns {Object} The item for which `callback` returned a true value.
	 */
	find( callback, ctx ) {
		return this._items.find( callback, ctx );
	}

	/**
	 * Returns an array with items for which the `callback` returned a true value.
	 *
	 * @param {Function} callback
	 * @param {Object} callback.item
	 * @param {Number} callback.index
	 * @param {Object} ctx Context in which the `callback` will be called.
	 * @returns {Object[]} The array with matching items.
	 */
	filter( callback, ctx ) {
		return this._items.filter( callback, ctx );
	}

	/**
	 * Removes all items from the collection and destroys the binding created using
	 * {@link #bindTo}.
	 */
	clear() {
		if ( this._bindToCollection ) {
			this.stopListening( this._bindToCollection );
			this._bindToCollection = null;
		}

		while ( this.length ) {
			this.remove( 0 );
		}
	}

	/**
	 * Binds and synchronizes the collection with another one.
	 *
	 * The binding can be a simple factory:
	 *
	 *		class FactoryClass {
	 *			constructor( data ) {
	 *				this.label = data.label;
	 *			}
	 *		}
	 *
	 *		const source = new Collection( { idProperty: 'label' } );
	 *		const target = new Collection();
	 *
	 *		target.bindTo( source ).as( FactoryClass );
	 *
	 *		source.add( { label: 'foo' } );
	 *		source.add( { label: 'bar' } );
	 *
	 *		console.log( target.length ); // 2
	 *		console.log( target.get( 1 ).label ); // 'bar'
	 *
	 *		source.remove( 0 );
	 *		console.log( target.length ); // 1
	 *		console.log( target.get( 0 ).label ); // 'bar'
	 *
	 * or the factory driven by a custom callback:
	 *
	 *		class FooClass {
	 *			constructor( data ) {
	 *				this.label = data.label;
	 *			}
	 *		}
	 *
	 *		class BarClass {
	 *			constructor( data ) {
	 *				this.label = data.label;
	 *			}
	 *		}
	 *
	 *		const source = new Collection( { idProperty: 'label' } );
	 *		const target = new Collection();
	 *
	 *		target.bindTo( source ).using( ( item ) => {
	 *			if ( item.label == 'foo' ) {
	 *				return new FooClass( item );
	 *			} else {
	 *				return new BarClass( item );
	 *			}
	 *		} );
	 *
	 *		source.add( { label: 'foo' } );
	 *		source.add( { label: 'bar' } );
	 *
	 *		console.log( target.length ); // 2
	 *		console.log( target.get( 0 ) instanceof FooClass ); // true
	 *		console.log( target.get( 1 ) instanceof BarClass ); // true
	 *
	 * or the factory out of property name:
	 *
	 *		const source = new Collection( { idProperty: 'label' } );
	 *		const target = new Collection();
	 *
	 *		target.bindTo( source ).using( 'label' );
	 *
	 *		source.add( { label: { value: 'foo' } } );
	 *		source.add( { label: { value: 'bar' } } );
	 *
	 *		console.log( target.length ); // 2
	 *		console.log( target.get( 0 ).value ); // 'foo'
	 *		console.log( target.get( 1 ).value ); // 'bar'
	 *
	 * It's possible to skip specified items by returning falsy value:
	 *
	 *		const source = new Collection();
	 *		const target = new Collection();
	 *
	 *		target.bindTo( source ).using( item => {
	 *			if ( item.hidden ) {
	 *				return null;
	 *			}
	 *
	 *			return item;
	 *		} );
	 *
	 *		source.add( { hidden: true } );
	 *		source.add( { hidden: false } );
	 *
	 *		console.log( source.length ); // 2
	 *		console.log( target.length ); // 1
	 *
	 * **Note**: {@link #clear} can be used to break the binding.
	 *
	 * @param {module:utils/collection~Collection} externalCollection A collection to be bound.
	 * @returns {Object}
	 * @returns {module:utils/collection~CollectionBindToChain} The binding chain object.
	 */
	bindTo( externalCollection ) {
		if ( this._bindToCollection ) {
			/**
			 * The collection cannot be bound more than once.
			 *
			 * @error collection-bind-to-rebind
			 */
			throw new CKEditorError( 'collection-bind-to-rebind: The collection cannot be bound more than once.', this );
		}

		this._bindToCollection = externalCollection;

		return {
			as: Class => {
				this._setUpBindToBinding( item => new Class( item ) );
			},

			using: callbackOrProperty => {
				if ( typeof callbackOrProperty == 'function' ) {
					this._setUpBindToBinding( item => callbackOrProperty( item ) );
				} else {
					this._setUpBindToBinding( item => item[ callbackOrProperty ] );
				}
			}
		};
	}

	/**
	 * Finalizes and activates a binding initiated by {#bindTo}.
	 *
	 * @protected
	 * @param {Function} factory A function which produces collection items.
	 */
	_setUpBindToBinding( factory ) {
		const externalCollection = this._bindToCollection;

		// Adds the item to the collection once a change has been done to the external collection.
		//
		// @private
		const addItem = ( evt, externalItem, index ) => {
			const isExternalBoundToThis = externalCollection._bindToCollection == this;
			const externalItemBound = externalCollection._bindToInternalToExternalMap.get( externalItem );

			// If an external collection is bound to this collection, which makes it a 2–way binding,
			// and the particular external collection item is already bound, don't add it here.
			// The external item has been created **out of this collection's item** and (re)adding it will
			// cause a loop.
			if ( isExternalBoundToThis && externalItemBound ) {
				this._bindToExternalToInternalMap.set( externalItem, externalItemBound );
				this._bindToInternalToExternalMap.set( externalItemBound, externalItem );
			} else {
				const item = factory( externalItem );

				// When there is no item we need to remember skipped index first and then we can skip this item.
				if ( !item ) {
					this._skippedIndexesFromExternal.push( index );

					return;
				}

				// Lets try to put item at the same index as index in external collection
				// but when there are a skipped items in one or both collections we need to recalculate this index.
				let finalIndex = index;

				// When we try to insert item after some skipped items from external collection we need
				// to include this skipped items and decrease index.
				//
				// For the following example:
				// external -> [ 'A', 'B - skipped for internal', 'C - skipped for internal' ]
				// internal -> [ A ]
				//
				// Another item is been added at the end of external collection:
				// external.add( 'D' )
				// external -> [ 'A', 'B - skipped for internal', 'C - skipped for internal', 'D' ]
				//
				// We can't just add 'D' to internal at the same index as index in external because
				// this will produce empty indexes what is invalid:
				// internal -> [ 'A', empty, empty, 'D' ]
				//
				// So we need to include skipped items and decrease index
				// internal -> [ 'A', 'D' ]
				for ( const skipped of this._skippedIndexesFromExternal ) {
					if ( index > skipped ) {
						finalIndex--;
					}
				}

				// We need to take into consideration that external collection could skip some items from
				// internal collection.
				//
				// For the following example:
				// internal -> [ 'A', 'B - skipped for external', 'C - skipped for external' ]
				// external -> [ A ]
				//
				// Another item is been added at the end of external collection:
				// external.add( 'D' )
				// external -> [ 'A', 'D' ]
				//
				// We need to include skipped items and place new item after them:
				// internal -> [ 'A', 'B - skipped for external', 'C - skipped for external', 'D' ]
				for ( const skipped of externalCollection._skippedIndexesFromExternal ) {
					if ( finalIndex >= skipped ) {
						finalIndex++;
					}
				}

				this._bindToExternalToInternalMap.set( externalItem, item );
				this._bindToInternalToExternalMap.set( item, externalItem );
				this.add( item, finalIndex );

				// After adding new element to internal collection we need update indexes
				// of skipped items in external collection.
				for ( let i = 0; i < externalCollection._skippedIndexesFromExternal.length; i++ ) {
					if ( finalIndex <= externalCollection._skippedIndexesFromExternal[ i ] ) {
						externalCollection._skippedIndexesFromExternal[ i ]++;
					}
				}
			}
		};

		// Load the initial content of the collection.
		for ( const externalItem of externalCollection ) {
			addItem( null, externalItem, externalCollection.getIndex( externalItem ) );
		}

		// Synchronize the with collection as new items are added.
		this.listenTo( externalCollection, 'add', addItem );

		// Synchronize the with collection as new items are removed.
		this.listenTo( externalCollection, 'remove', ( evt, externalItem, index ) => {
			const item = this._bindToExternalToInternalMap.get( externalItem );

			if ( item ) {
				this.remove( item );
			}

			// After removing element from external collection we need update/remove indexes
			// of skipped items in internal collection.
			this._skippedIndexesFromExternal = this._skippedIndexesFromExternal.reduce( ( result, skipped ) => {
				if ( index < skipped ) {
					result.push( skipped - 1 );
				}

				if ( index > skipped ) {
					result.push( skipped );
				}

				return result;
			}, [] );
		} );
	}

	/**
	 * Returns an unique id property for a given `item`.
	 *
	 * The method will generate new id and assign it to the `item` if it doesn't have any.
	 *
	 * @private
	 * @param {Object} item Item to be added.
	 * @returns {String}
	 */
	_getItemIdBeforeAdding( item ) {
		const idProperty = this._idProperty;
		let itemId;

		if ( ( idProperty in item ) ) {
			itemId = item[ idProperty ];

			if ( typeof itemId != 'string' ) {
				/**
				 * This item's id should be a string.
				 *
				 * @error collection-add-invalid-id
				 * @param {Object} item The item being added to the collection.
				 * @param {module:utils/collection~Collection} collection The collection the item is added to.
				 */
				throw new CKEditorError( 'collection-add-invalid-id', {
					item,
					collection: this,
				} );
			}

			if ( this.get( itemId ) ) {
				/**
				 * This item already exists in the collection.
				 *
				 * @error collection-add-item-already-exists
				 * @param {Object} item The item being added to the collection.
				 * @param {module:utils/collection~Collection} collection The collection the item is added to.
				 */
				throw new CKEditorError( 'collection-add-item-already-exists', {
					item,
					collection: this
				} );
			}
		} else {
			item[ idProperty ] = itemId = uid();
		}

		return itemId;
	}

	/**
	 * Iterable interface.
	 *
	 * @returns {Iterable.<*>}
	 */
	[ Symbol.iterator ]() {
		return this._items[ Symbol.iterator ]();
	}

	/**
	 * Fired when an item is added to the collection.
	 *
	 * @event add
	 * @param {Object} item The added item.
	 */

	/**
	 * Fired when an item is removed from the collection.
	 *
	 * @event remove
	 * @param {Object} item The removed item.
	 * @param {Number} index Index from which item was removed.
	 */
}

mix( Collection, EmitterMixin );

/**
 * An object returned by the {@link module:utils/collection~Collection#bindTo `bindTo()`} method
 * providing functions that specify the type of the binding.
 *
 * See the {@link module:utils/collection~Collection#bindTo `bindTo()`} documentation for examples.
 *
 * @interface module:utils/collection~CollectionBindToChain
 */

/**
 * Creates a callback or a property binding.
 *
 * @method #using
 * @param {Function|String} callbackOrProperty  When the function is passed, it should return
 * the collection items. When the string is provided, the property value is used to create the bound collection items.
 */

/**
 * Creates the class factory binding in which items of the source collection are passed to
 * the constructor of the specified class.
 *
 * @method #as
 * @param {Function} Class The class constructor used to create instances in the factory.
 */
