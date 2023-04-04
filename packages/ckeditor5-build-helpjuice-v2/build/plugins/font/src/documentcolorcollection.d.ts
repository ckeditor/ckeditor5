/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module font/documentcolorcollection
 */
import type { ColorDefinition } from 'ckeditor5/src/ui';
import { Collection, type CollectionAddEvent, type CollectionRemoveEvent, type CollectionChangeEvent } from 'ckeditor5/src/utils';
declare const DocumentColorCollection_base: import("ckeditor5/src/utils").Mixed<{
    new (options?: {
        readonly idProperty?: string | undefined;
    } | undefined): Collection<ColorDefinition>;
    new (initialItems: Iterable<ColorDefinition>, options?: {
        readonly idProperty?: string | undefined;
    } | undefined): Collection<ColorDefinition>;
}, import("ckeditor5/src/utils").Observable>;
/**
 * A collection to store document colors. It enforces colors to be unique.
 */
export default class DocumentColorCollection extends DocumentColorCollection_base {
    /**
     * Indicates whether the document color collection is empty.
     *
     * @observable
     */
    readonly isEmpty: boolean;
    constructor(options?: any);
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
    add(item: ColorDefinition, index?: number): this;
    /**
     * Checks if an object with given colors is present in the document color collection.
     */
    hasColor(color: string): boolean;
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
export {};
