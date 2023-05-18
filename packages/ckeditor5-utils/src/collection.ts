/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/collection
 */

import EmitterMixin from './emittermixin';
import CKEditorError from './ckeditorerror';
import uid from './uid';
import isIterable from './isiterable';

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
 * @typeParam T The type of the collection element.
 */
export default class Collection<T extends Record<string, any>> extends EmitterMixin() implements Iterable<T> {
	/**
	 * The internal list of items in the collection.
	 */
	private readonly _items: Array<T>;

	/**
	 * The internal map of items in the collection.
	 */
	private readonly _itemMap: Map<string, T>;

	/**
	 * The name of the property which is considered to identify an item.
	 */
	private readonly _idProperty: string;

	/**
	 * A collection instance this collection is bound to as a result
	 * of calling {@link #bindTo} method.
	 */
	private _bindToCollection?: Collection<any> | null;

	/**
	 * A helper mapping external items of a bound collection ({@link #bindTo})
	 * and actual items of this collection. It provides information
	 * necessary to properly remove items bound to another collection.
	 *
	 * See {@link #_bindToInternalToExternalMap}.
	 */
	private readonly _bindToExternalToInternalMap: WeakMap<any, T>;

	/**
	 * A helper mapping items of this collection to external items of a bound collection
	 * ({@link #bindTo}). It provides information necessary to manage the bindings, e.g.
	 * to avoid loops in two–way bindings.
	 *
	 * See {@link #_bindToExternalToInternalMap}.
	 */
	private readonly _bindToInternalToExternalMap: WeakMap<T, any>;

	/**
	 * Stores indexes of skipped items from bound external collection.
	 */
	private _skippedIndexesFromExternal: Array<number>;

	/**
	 * Creates a new Collection instance.
	 *
	 * You can pass a configuration object as the argument of the constructor:
	 *
	 * ```ts
	 * const emptyCollection = new Collection<{ name: string }>( { idProperty: 'name' } );
	 * emptyCollection.add( { name: 'John' } );
	 * console.log( collection.get( 'John' ) ); // -> { name: 'John' }
	 * ```
	 *
	 * The collection is empty by default. You can add new items using the {@link #add} method:
	 *
	 * ```ts
	 * const collection = new Collection<{ id: string }>();
	 *
	 * collection.add( { id: 'John' } );
	 * console.log( collection.get( 0 ) ); // -> { id: 'John' }
	 * ```
	 *
	 * @label NO_ITEMS
	 * @param options The options object.
	 * @param options.idProperty The name of the property which is used to identify an item.
	 * Items that do not have such a property will be assigned one when added to the collection.
	 */
	constructor( options?: { readonly idProperty?: string } );

	/**
	 * Creates a new Collection instance with specified initial items.
	 *
	 * ```ts
	 * const collection = new Collection<{ id: string }>( [ { id: 'John' }, { id: 'Mike' } ] );
	 *
	 * console.log( collection.get( 0 ) ); // -> { id: 'John' }
	 * console.log( collection.get( 1 ) ); // -> { id: 'Mike' }
	 * console.log( collection.get( 'Mike' ) ); // -> { id: 'Mike' }
	 * ```
	 *
	 * You can always pass a configuration object as the last argument of the constructor:
	 *
	 * ```ts
	 * const nonEmptyCollection = new Collection<{ name: string }>( [ { name: 'John' } ], { idProperty: 'name' } );
	 * nonEmptyCollection.add( { name: 'George' } );
	 * console.log( collection.get( 'George' ) ); // -> { name: 'George' }
	 * console.log( collection.get( 'John' ) ); // -> { name: 'John' }
	 * ```
	 *
	 * @label INITIAL_ITEMS
	 * @param initialItems The initial items of the collection.
	 * @param options The options object.
	 * @param options.idProperty The name of the property which is used to identify an item.
	 * Items that do not have such a property will be assigned one when added to the collection.
	 */
	constructor( initialItems: Iterable<T>, options?: { readonly idProperty?: string } );

	constructor(
		initialItemsOrOptions: Iterable<T> | { readonly idProperty?: string } = {},
		options: { readonly idProperty?: string } = {}
	) {
		super();

		const hasInitialItems = isIterable( initialItemsOrOptions );

		if ( !hasInitialItems ) {
			options = initialItemsOrOptions;
		}

		this._items = [];
		this._itemMap = new Map();
		this._idProperty = options.idProperty || 'id';
		this._bindToExternalToInternalMap = new WeakMap();
		this._bindToInternalToExternalMap = new WeakMap();
		this._skippedIndexesFromExternal = [];

		// Set the initial content of the collection (if provided in the constructor).
		if ( hasInitialItems ) {
			for ( const item of initialItemsOrOptions ) {
				this._items.push( item );
				this._itemMap.set( this._getItemIdBeforeAdding( item ), item );
			}
		}
	}

	/**
	 * The number of items available in the collection.
	 */
	public get length(): number {
		return this._items.length;
	}

	/**
	 * Returns the first item from the collection or null when collection is empty.
	 */
	public get first(): T | null {
		return this._items[ 0 ] || null;
	}

	/**
	 * Returns the last item from the collection or null when collection is empty.
	 */
	public get last(): T | null {
		return this._items[ this.length - 1 ] || null;
	}

	/**
	 * Adds an item into the collection.
	 *
	 * If the item does not have an id, then it will be automatically generated and set on the item.
	 *
	 * @param item
	 * @param index The position of the item in the collection. The item
	 * is pushed to the collection when `index` not specified.
	 * @fires add
	 * @fires change
	 */
	public add( item: T, index?: number ): this {
		return this.addMany( [ item ], index );
	}

	/**
	 * Adds multiple items into the collection.
	 *
	 * Any item not containing an id will get an automatically generated one.
	 *
	 * @param items
	 * @param index The position of the insertion. Items will be appended if no `index` is specified.
	 * @fires add
	 * @fires change
	 */
	public addMany( items: Iterable<T>, index?: number ): this {
		if ( index === undefined ) {
			index = this._items.length;
		} else if ( index > this._items.length || index < 0 ) {
			/**
			 * The `index` passed to {@link module:utils/collection~Collection#addMany `Collection#addMany()`}
			 * is invalid. It must be a number between 0 and the collection's length.
			 *
			 * @error collection-add-item-invalid-index
			 */
			throw new CKEditorError( 'collection-add-item-invalid-index', this );
		}

		let offset = 0;

		for ( const item of items ) {
			const itemId = this._getItemIdBeforeAdding( item );
			const currentItemIndex = index + offset;

			this._items.splice( currentItemIndex, 0, item );
			this._itemMap.set( itemId, item );

			this.fire<CollectionAddEvent<T>>( 'add', item, currentItemIndex );

			offset++;
		}

		this.fire<CollectionChangeEvent<T>>( 'change', {
			added: items,
			removed: [],
			index
		} );

		return this;
	}

	/**
	 * Gets an item by its ID or index.
	 *
	 * @param idOrIndex The item ID or index in the collection.
	 * @returns The requested item or `null` if such item does not exist.
	 */
	public get( idOrIndex: string | number ): T | null {
		let item: T | undefined;

		if ( typeof idOrIndex == 'string' ) {
			item = this._itemMap.get( idOrIndex );
		} else if ( typeof idOrIndex == 'number' ) {
			item = this._items[ idOrIndex ];
		} else {
			/**
			 * An index or ID must be given.
			 *
			 * @error collection-get-invalid-arg
			 */
			throw new CKEditorError( 'collection-get-invalid-arg', this );
		}

		return item || null;
	}

	/**
	 * Returns a Boolean indicating whether the collection contains an item.
	 *
	 * @param itemOrId The item or its ID in the collection.
	 * @returns `true` if the collection contains the item, `false` otherwise.
	 */
	public has( itemOrId: T | string ): boolean {
		if ( typeof itemOrId == 'string' ) {
			return this._itemMap.has( itemOrId );
		} else { // Object
			const idProperty = this._idProperty;
			const id = itemOrId[ idProperty ];

			return id && this._itemMap.has( id );
		}
	}

	/**
	 * Gets an index of an item in the collection.
	 * When an item is not defined in the collection, the index will equal -1.
	 *
	 * @param itemOrId The item or its ID in the collection.
	 * @returns The index of a given item.
	 */
	public getIndex( itemOrId: T | string ): number {
		let item: T | undefined;

		if ( typeof itemOrId == 'string' ) {
			item = this._itemMap.get( itemOrId );
		} else {
			item = itemOrId;
		}

		return item ? this._items.indexOf( item ) : -1;
	}

	/**
	 * Removes an item from the collection.
	 *
	 * @param subject The item to remove, its ID or index in the collection.
	 * @returns The removed item.
	 * @fires remove
	 * @fires change
	 */
	public remove( subject: T | number | string ): T {
		const [ item, index ] = this._remove( subject );

		this.fire<CollectionChangeEvent<T>>( 'change', {
			added: [],
			removed: [ item ],
			index
		} );

		return item;
	}

	/**
	 * Executes the callback for each item in the collection and composes an array or values returned by this callback.
	 *
	 * @typeParam U The result type of the callback.
	 * @param callback
	 * @param ctx Context in which the `callback` will be called.
	 * @returns The result of mapping.
	 */
	public map<U>(
		callback: ( item: T, index: number ) => U,
		ctx?: any
	): Array<U> {
		return this._items.map( callback, ctx );
	}

	/**
	 * Finds the first item in the collection for which the `callback` returns a true value.
	 *
	 * @param callback
	 * @param ctx Context in which the `callback` will be called.
	 * @returns The item for which `callback` returned a true value.
	 */
	public find(
		callback: ( item: T, index: number ) => boolean,
		ctx?: any
	): T | undefined {
		return this._items.find( callback, ctx );
	}

	/**
	 * Returns an array with items for which the `callback` returned a true value.
	 *
	 * @param callback
	 * @param ctx Context in which the `callback` will be called.
	 * @returns The array with matching items.
	 */
	public filter(
		callback: ( item: T, index: number ) => boolean,
		ctx?: any
	): Array<T> {
		return this._items.filter( callback, ctx );
	}

	/**
	 * Removes all items from the collection and destroys the binding created using
	 * {@link #bindTo}.
	 *
	 * @fires remove
	 * @fires change
	 */
	public clear(): void {
		if ( this._bindToCollection ) {
			this.stopListening( this._bindToCollection );
			this._bindToCollection = null;
		}

		const removedItems = Array.from( this._items );

		while ( this.length ) {
			this._remove( 0 );
		}

		this.fire<CollectionChangeEvent<T>>( 'change', {
			added: [],
			removed: removedItems,
			index: 0
		} );
	}

	/**
	 * Binds and synchronizes the collection with another one.
	 *
	 * The binding can be a simple factory:
	 *
	 * ```ts
	 * class FactoryClass {
	 * 	public label: string;
	 *
	 * 	constructor( data: { label: string } ) {
	 * 		this.label = data.label;
	 * 	}
	 * }
	 *
	 * const source = new Collection<{ label: string }>( { idProperty: 'label' } );
	 * const target = new Collection<FactoryClass>();
	 *
	 * target.bindTo( source ).as( FactoryClass );
	 *
	 * source.add( { label: 'foo' } );
	 * source.add( { label: 'bar' } );
	 *
	 * console.log( target.length ); // 2
	 * console.log( target.get( 1 ).label ); // 'bar'
	 *
	 * source.remove( 0 );
	 * console.log( target.length ); // 1
	 * console.log( target.get( 0 ).label ); // 'bar'
	 * ```
	 *
	 * or the factory driven by a custom callback:
	 *
	 * ```ts
	 * class FooClass {
	 * 	public label: string;
	 *
	 * 	constructor( data: { label: string } ) {
	 * 		this.label = data.label;
	 * 	}
	 * }
	 *
	 * class BarClass {
	 * 	public label: string;
	 *
	 * 	constructor( data: { label: string } ) {
	 * 		this.label = data.label;
	 * 	}
	 * }
	 *
	 * const source = new Collection<{ label: string }>( { idProperty: 'label' } );
	 * const target = new Collection<FooClass | BarClass>();
	 *
	 * target.bindTo( source ).using( ( item ) => {
	 * 	if ( item.label == 'foo' ) {
	 * 		return new FooClass( item );
	 * 	} else {
	 * 		return new BarClass( item );
	 * 	}
	 * } );
	 *
	 * source.add( { label: 'foo' } );
	 * source.add( { label: 'bar' } );
	 *
	 * console.log( target.length ); // 2
	 * console.log( target.get( 0 ) instanceof FooClass ); // true
	 * console.log( target.get( 1 ) instanceof BarClass ); // true
	 * ```
	 *
	 * or the factory out of property name:
	 *
	 * ```ts
	 * const source = new Collection<{ nested: { value: string } }>();
	 * const target = new Collection<{ value: string }>();
	 *
	 * target.bindTo( source ).using( 'nested' );
	 *
	 * source.add( { nested: { value: 'foo' } } );
	 * source.add( { nested: { value: 'bar' } } );
	 *
	 * console.log( target.length ); // 2
	 * console.log( target.get( 0 ).value ); // 'foo'
	 * console.log( target.get( 1 ).value ); // 'bar'
	 * ```
	 *
	 * It's possible to skip specified items by returning null value:
	 *
	 * ```ts
	 * const source = new Collection<{ hidden: boolean }>();
	 * const target = new Collection<{ hidden: boolean }>();
	 *
	 * target.bindTo( source ).using( item => {
	 * 	if ( item.hidden ) {
	 * 		return null;
	 * 	}
	 *
	 * 	return item;
	 * } );
	 *
	 * source.add( { hidden: true } );
	 * source.add( { hidden: false } );
	 *
	 * console.log( source.length ); // 2
	 * console.log( target.length ); // 1
	 * ```
	 *
	 * **Note**: {@link #clear} can be used to break the binding.
	 *
	 * @typeParam S The type of `externalCollection` element.
	 * @param externalCollection A collection to be bound.
	 * @returns The binding chain object.
	 */
	public bindTo<S extends Record<string, any>>(
		externalCollection: Collection<S>
	): CollectionBindToChain<S, T> {
		if ( this._bindToCollection ) {
			/**
			 * The collection cannot be bound more than once.
			 *
			 * @error collection-bind-to-rebind
			 */
			throw new CKEditorError( 'collection-bind-to-rebind', this );
		}

		this._bindToCollection = externalCollection;

		return {
			as: Class => {
				this._setUpBindToBinding<S>( item => new Class( item ) );
			},

			using: callbackOrProperty => {
				if ( typeof callbackOrProperty == 'function' ) {
					this._setUpBindToBinding<S>( callbackOrProperty );
				} else {
					this._setUpBindToBinding<S>( item => item[ callbackOrProperty ] );
				}
			}
		};
	}

	/**
	 * Finalizes and activates a binding initiated by {@link #bindTo}.
	 *
	 * @param factory A function which produces collection items.
	 */
	private _setUpBindToBinding<S>( factory: ( item: S ) => T | null ): void {
		const externalCollection = this._bindToCollection!;

		// Adds the item to the collection once a change has been done to the external collection.
		const addItem = ( evt: unknown, externalItem: S, index: number ) => {
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
		this.listenTo<CollectionAddEvent<S>>( externalCollection, 'add', addItem );

		// Synchronize the with collection as new items are removed.
		this.listenTo<CollectionRemoveEvent<S>>( externalCollection, 'remove', ( evt, externalItem, index ) => {
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
			}, [] as Array<number> );
		} );
	}

	/**
	 * Returns an unique id property for a given `item`.
	 *
	 * The method will generate new id and assign it to the `item` if it doesn't have any.
	 *
	 * @param item Item to be added.
	 */
	private _getItemIdBeforeAdding( item: any ): string {
		const idProperty = this._idProperty;
		let itemId: string | undefined;

		if ( ( idProperty in item ) ) {
			itemId = item[ idProperty ];

			if ( typeof itemId != 'string' ) {
				/**
				 * This item's ID should be a string.
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

		return itemId;
	}

	/**
	 * Core {@link #remove} method implementation shared in other functions.
	 *
	 * In contrast this method **does not** fire the {@link #event:change} event.
	 *
	 * @param subject The item to remove, its id or index in the collection.
	 * @returns Returns an array with the removed item and its index.
	 * @fires remove
	 */
	private _remove( subject: T | number | string ): [ item: T, index: number ] {
		let index: number, id: string, item: T;
		let itemDoesNotExist = false;
		const idProperty = this._idProperty;

		if ( typeof subject == 'string' ) {
			id = subject;
			item = this._itemMap.get( id )!;
			itemDoesNotExist = !item;

			if ( item ) {
				index = this._items.indexOf( item );
			}
		} else if ( typeof subject == 'number' ) {
			index = subject;
			item = this._items[ index ];
			itemDoesNotExist = !item;

			if ( item ) {
				id = item[ idProperty ]!;
			}
		} else {
			item = subject;
			id = item[ idProperty ]!;
			index = this._items.indexOf( item );
			itemDoesNotExist = ( index == -1 || !this._itemMap.get( id ) );
		}

		if ( itemDoesNotExist ) {
			/**
			 * Item not found.
			 *
			 * @error collection-remove-404
			 */
			throw new CKEditorError( 'collection-remove-404', this );
		}

		this._items.splice( index!, 1 );
		this._itemMap.delete( id! );

		const externalItem = this._bindToInternalToExternalMap.get( item );
		this._bindToInternalToExternalMap.delete( item );
		this._bindToExternalToInternalMap.delete( externalItem );

		this.fire<CollectionRemoveEvent<T>>( 'remove', item, index! );

		return [ item, index! ];
	}

	/**
	 * Iterable interface.
	 */
	public [ Symbol.iterator ](): Iterator<T> {
		return this._items[ Symbol.iterator ]();
	}
}

/**
 * Fired when an item is added to the collection.
 *
 * @eventName ~Collection#add
 * @param item The added item.
 * @param index An index where the addition occurred.
 */
export type CollectionAddEvent<T = any> = {
	name: 'add';
	args: [ item: T, index: number ];
};

/**
 * Fired when the collection was changed due to adding or removing items.
 *
 * @eventName ~Collection#change
 * @param data Changed items.
 */
export type CollectionChangeEvent<T = any> = {
	name: 'change';
	args: [ data: CollectionChangeEventData<T> ];
};

/**
 * A structure describing the {@link ~Collection#event:change `Collection#change`} event.
 */
export type CollectionChangeEventData<T = any> = {

	/**
	 * A list of added items.
	 */
	added: Iterable<T>;

	/**
	 * A list of removed items.
	 */
	removed: Iterable<T>;

	/**
	 * An index where the addition or removal occurred.
	 */
	index: number;
};

/**
 * Fired when an item is removed from the collection.
 *
 * @eventName ~Collection#remove
 * @param item The removed item.
 * @param index Index from which item was removed.
 */
export type CollectionRemoveEvent<T = any> = {
	name: 'remove';
	args: [ item: T, index: number ];
};

/**
 * An object returned by the {@link module:utils/collection~Collection#bindTo `bindTo()`} method
 * providing functions that specify the type of the binding.
 *
 * See the {@link module:utils/collection~Collection#bindTo `bindTo()`} documentation for examples.
 */
export interface CollectionBindToChain<S, T> {

	/**
	 * Creates the class factory binding in which items of the source collection are passed to
	 * the constructor of the specified class.
	 *
	 * @param Class The class constructor used to create instances in the factory.
	 */
	as( Class: new ( item: S ) => T ): void;

	/**
	 * Creates a callback or a property binding.
	 *
	 * @param callbackOrProperty When the function is passed, it should return
	 * the collection items. When the string is provided, the property value is used to create the bound collection items.
	 */
	using( callbackOrProperty: keyof S | ( ( item: S ) => T | null ) ): void;
}
