/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/colorselector/documentcolorcollection
 */

import type { ColorDefinition } from '../colorgrid/colorgridview.js';
import {
	Collection,
	ObservableMixin,
	type CollectionAddEvent,
	type CollectionRemoveEvent,
	type CollectionChangeEvent
} from '@ckeditor/ckeditor5-utils';

/**
 * A collection to store document colors. It enforces colors to be unique.
 */
export default class DocumentColorCollection extends /* #__PURE__ */ ObservableMixin( Collection<ColorDefinition> ) {
	/**
	 * Indicates whether the document color collection is empty.
	 *
	 * @observable
	 */
	declare public readonly isEmpty: boolean;

	constructor( options?: any ) {
		super( options );

		this.set( 'isEmpty', true );

		this.on( 'change', () => {
			this.set( 'isEmpty', this.length === 0 );
		} );
	}

	/**
	 * Adds a color to the document color collection.
	 *
	 * This method ensures that no color duplicates are inserted (compared using
	 * the color value of the {@link module:ui/colorgrid/colorgridview~ColorDefinition}).
	 *
	 * If the item does not have an ID, it will be automatically generated and set on the item.
	 *
	 * @param index The position of the item in the collection. The item is pushed to the collection when `index` is not specified.
	 * @fires add
	 * @fires change
	 */
	public override add( item: ColorDefinition, index?: number ): this {
		if ( this.find( element => element.color === item.color ) ) {
			// No duplicates are allowed.
			return this;
		}

		return super.add( item, index );
	}

	/**
	 * Checks if an object with given colors is present in the document color collection.
	 */
	public hasColor( color: string ): boolean {
		return !!this.find( item => item.color === color );
	}
}

/**
 * Fired when the collection was changed due to adding or removing items.
 *
 * @eventName ~DocumentColorCollection#change
 * @param data Changed items.
 */
export type DocumentColorCollectionChangeEvent = CollectionChangeEvent;

/**
 * Fired when an item is added to the collection.
 *
 * @eventName ~DocumentColorCollection#add
 * @param item The added item.
 * @param index An index where the addition occurred.
 */
export type DocumentColorCollectionAddEvent = CollectionAddEvent;

/**
 * Fired when an item is removed from the collection.
 *
 * @eventName ~DocumentColorCollection#remove
 * @param item The removed item.
 * @param index Index from which item was removed.
 */
export type DocumentColorCollectionRemoveEvent = CollectionRemoveEvent;
