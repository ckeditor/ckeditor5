/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module link/utils/automaticdecorators
 */
import { type ArrayOrItem } from 'ckeditor5/src/utils';
import type { DowncastDispatcher } from 'ckeditor5/src/engine';
import type { NormalizedLinkDecoratorAutomaticDefinition } from '../utils';
/**
 * Helper class that ties together all {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition} and provides
 * the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#attributeToElement downcast dispatchers} for them.
 */
export default class AutomaticDecorators {
    /**
     * Stores the definition of {@link module:link/linkconfig~LinkDecoratorAutomaticDefinition automatic decorators}.
     * This data is used as a source for a downcast dispatcher to create a proper conversion to output data.
     */
    private _definitions;
    /**
     * Gives information about the number of decorators stored in the {@link module:link/utils/automaticdecorators~AutomaticDecorators}
     * instance.
     */
    get length(): number;
    /**
     * Adds automatic decorator objects or an array with them to be used during downcasting.
     *
     * @param item A configuration object of automatic rules for decorating links. It might also be an array of such objects.
     */
    add(item: ArrayOrItem<NormalizedLinkDecoratorAutomaticDefinition>): void;
    /**
     * Provides the conversion helper used in the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add} method.
     *
     * @returns A dispatcher function used as conversion helper in {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add}.
     */
    getDispatcher(): (dispatcher: DowncastDispatcher) => void;
    /**
     * Provides the conversion helper used in the {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add} method
     * when linking images.
     *
     * @returns A dispatcher function used as conversion helper in {@link module:engine/conversion/downcasthelpers~DowncastHelpers#add}.
     */
    getDispatcherForLinkedImage(): (dispatcher: DowncastDispatcher) => void;
}
