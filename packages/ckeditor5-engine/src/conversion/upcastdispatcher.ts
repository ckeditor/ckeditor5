/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/conversion/upcastdispatcher
 */

import ViewConsumable from './viewconsumable.js';
import ModelRange from '../model/range.js';
import ModelPosition from '../model/position.js';
import type ModelElement from '../model/element.js';
import type ModelNode from '../model/node.js';
import type ViewElement from '../view/element.js';
import type ViewText from '../view/text.js';
import type ViewDocumentFragment from '../view/documentfragment.js';
import type ModelDocumentFragment from '../model/documentfragment.js';
import type { default as Schema, SchemaContextDefinition } from '../model/schema.js';
import { SchemaContext } from '../model/schema.js'; // eslint-disable-line no-duplicate-imports
import type ModelWriter from '../model/writer.js';
import { isParagraphable, wrapInParagraph } from '../model/utils/autoparagraphing.js';

import type ViewItem from '../view/item.js';

import { CKEditorError, EmitterMixin } from '@ckeditor/ckeditor5-utils';

/**
 * Upcast dispatcher is a central point of the view-to-model conversion, which is a process of
 * converting a given {@link module:engine/view/documentfragment~DocumentFragment view document fragment} or
 * {@link module:engine/view/element~Element view element} into a correct model structure.
 *
 * During the conversion process, the dispatcher fires events for all {@link module:engine/view/node~Node view nodes}
 * from the converted view document fragment.
 * Special callbacks called "converters" should listen to these events in order to convert the view nodes.
 *
 * The second parameter of the callback is the `data` object with the following properties:
 *
 * * `data.viewItem` contains a {@link module:engine/view/node~Node view node} or a
 * {@link module:engine/view/documentfragment~DocumentFragment view document fragment}
 * that is converted at the moment and might be handled by the callback.
 * * `data.modelRange` is used to point to the result
 * of the current conversion (e.g. the element that is being inserted)
 * and is always a {@link module:engine/model/range~Range} when the conversion succeeds.
 * * `data.modelCursor` is a {@link module:engine/model/position~Position position} on which the converter should insert
 * the newly created items.
 *
 * The third parameter of the callback is an instance of {@link module:engine/conversion/upcastdispatcher~UpcastConversionApi}
 * which provides additional tools for converters.
 *
 * You can read more about conversion in the {@glink framework/deep-dive/conversion/upcast Upcast conversion} guide.
 *
 * Examples of event-based converters:
 *
 * ```ts
 * // A converter for links (<a>).
 * editor.data.upcastDispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
 * 	if ( conversionApi.consumable.consume( data.viewItem, { name: true, attributes: [ 'href' ] } ) ) {
 * 		// The <a> element is inline and is represented by an attribute in the model.
 * 		// This is why you need to convert only children.
 * 		const { modelRange } = conversionApi.convertChildren( data.viewItem, data.modelCursor );
 *
 * 		for ( let item of modelRange.getItems() ) {
 * 			if ( conversionApi.schema.checkAttribute( item, 'linkHref' ) ) {
 * 				conversionApi.writer.setAttribute( 'linkHref', data.viewItem.getAttribute( 'href' ), item );
 * 			}
 * 		}
 * 	}
 * } );
 *
 * // Convert <p> element's font-size style.
 * // Note: You should use a low-priority observer in order to ensure that
 * // it is executed after the element-to-element converter.
 * editor.data.upcastDispatcher.on( 'element:p', ( evt, data, conversionApi ) => {
 * 	const { consumable, schema, writer } = conversionApi;
 *
 * 	if ( !consumable.consume( data.viewItem, { style: 'font-size' } ) ) {
 * 		return;
 * 	}
 *
 * 	const fontSize = data.viewItem.getStyle( 'font-size' );
 *
 * 	// Do not go for the model element after data.modelCursor because it might happen
 * 	// that a single view element was converted to multiple model elements. Get all of them.
 * 	for ( const item of data.modelRange.getItems( { shallow: true } ) ) {
 * 		if ( schema.checkAttribute( item, 'fontSize' ) ) {
 * 			writer.setAttribute( 'fontSize', fontSize, item );
 * 		}
 * 	}
 * }, { priority: 'low' } );
 *
 * // Convert all elements which have no custom converter into a paragraph (autoparagraphing).
 * editor.data.upcastDispatcher.on( 'element', ( evt, data, conversionApi ) => {
 * 	// Check if an element can be converted.
 * 	if ( !conversionApi.consumable.test( data.viewItem, { name: data.viewItem.name } ) ) {
 * 		// When an element is already consumed by higher priority converters, do nothing.
 * 		return;
 * 	}
 *
 * 	const paragraph = conversionApi.writer.createElement( 'paragraph' );
 *
 * 	// Try to safely insert a paragraph at the model cursor - it will find an allowed parent for the current element.
 * 	if ( !conversionApi.safeInsert( paragraph, data.modelCursor ) ) {
 * 		// When an element was not inserted, it means that you cannot insert a paragraph at this position.
 * 		return;
 * 	}
 *
 * 	// Consume the inserted element.
 * 	conversionApi.consumable.consume( data.viewItem, { name: data.viewItem.name } ) );
 *
 * 	// Convert the children to a paragraph.
 * 	const { modelRange } = conversionApi.convertChildren( data.viewItem,  paragraph ) );
 *
 * 	// Update `modelRange` and `modelCursor` in the `data` as a conversion result.
 * 	conversionApi.updateConversionResult( paragraph, data );
 * }, { priority: 'low' } );
 * ```
 *
 * @fires viewCleanup
 * @fires element
 * @fires text
 * @fires documentFragment
 */
export default class UpcastDispatcher extends /* #__PURE__ */ EmitterMixin() {
	/**
	 * An interface passed by the dispatcher to the event callbacks.
	 */
	public conversionApi: UpcastConversionApi;

	/**
	 * The list of elements that were created during splitting.
	 *
	 * After the conversion process, the list is cleared.
	 */
	private _splitParts = new Map<ModelElement, Array<ModelElement>>();

	/**
	 * The list of cursor parent elements that were created during splitting.
	 *
	 * After the conversion process the list is cleared.
	 */
	private _cursorParents = new Map<ModelNode, ModelElement | ModelDocumentFragment>();

	/**
	 * The position in the temporary structure where the converted content is inserted. The structure reflects the context of
	 * the target position where the content will be inserted. This property is built based on the context parameter of the
	 * convert method.
	 */
	private _modelCursor: ModelPosition | null = null;

	/**
	 * The list of elements that were created during the splitting but should not get removed on conversion end even if they are empty.
	 *
	 * The list is cleared after the conversion process.
	 */
	private _emptyElementsToKeep = new Set<ModelElement>();

	/**
	 * Creates an upcast dispatcher that operates using the passed API.
	 *
	 * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi
	 * @param conversionApi Additional properties for an interface that will be passed to events fired
	 * by the upcast dispatcher.
	 */
	constructor( conversionApi: Pick<UpcastConversionApi, 'schema'> ) {
		super();

		this.conversionApi = {
			...conversionApi,
			consumable: null as any,
			writer: null as any,
			store: null,
			convertItem: ( viewItem, modelCursor ) => this._convertItem( viewItem, modelCursor ),
			convertChildren: ( viewElement, positionOrElement ) => this._convertChildren( viewElement, positionOrElement ),
			safeInsert: ( modelNode, position ) => this._safeInsert( modelNode, position ),
			updateConversionResult: ( modelElement, data ) => this._updateConversionResult( modelElement, data ),
			// Advanced API - use only if custom position handling is needed.
			splitToAllowedParent: ( modelNode, modelCursor ) => this._splitToAllowedParent( modelNode, modelCursor ),
			getSplitParts: modelElement => this._getSplitParts( modelElement ),
			keepEmptyElement: modelElement => this._keepEmptyElement( modelElement )
		};
	}

	/**
	 * Starts the conversion process. The entry point for the conversion.
	 *
	 * @fires element
	 * @fires text
	 * @fires documentFragment
	 * @param viewElement The part of the view to be converted.
	 * @param writer An instance of the model writer.
	 * @param context Elements will be converted according to this context.
	 * @returns Model data that is the result of the conversion process
	 * wrapped in `DocumentFragment`. Converted marker elements will be set as the document fragment's
	 * {@link module:engine/model/documentfragment~DocumentFragment#markers static markers map}.
	 */
	public convert(
		viewElement: ViewElement | ViewDocumentFragment,
		writer: ModelWriter,
		context: SchemaContextDefinition = [ '$root' ]
	): ModelDocumentFragment {
		this.fire<UpcastViewCleanupEvent>( 'viewCleanup', viewElement );

		// Create context tree and set position in the top element.
		// Items will be converted according to this position.
		this._modelCursor = createContextTree( context, writer )!;

		// Store writer in conversion as a conversion API
		// to be sure that conversion process will use the same batch.
		this.conversionApi.writer = writer;

		// Create consumable values list for conversion process.
		this.conversionApi.consumable = ViewConsumable.createFrom( viewElement );

		// Custom data stored by converter for conversion process.
		this.conversionApi.store = {};

		// Do the conversion.
		const { modelRange } = this._convertItem( viewElement, this._modelCursor );

		// Conversion result is always a document fragment so let's create it.
		const documentFragment = writer.createDocumentFragment();

		// When there is a conversion result.
		if ( modelRange ) {
			// Remove all empty elements that were created while splitting.
			this._removeEmptyElements();

			// Move all items that were converted in context tree to the document fragment.
			const parent = this._modelCursor.parent;
			const children = parent._removeChildren( 0, parent.childCount );

			documentFragment._insertChild( 0, children );

			// Extract temporary markers elements from model and set as static markers collection.
			( documentFragment as any ).markers = extractMarkersFromModelFragment( documentFragment, writer );
		}

		// Clear context position.
		this._modelCursor = null;

		// Clear split elements & parents lists.
		this._splitParts.clear();
		this._cursorParents.clear();
		this._emptyElementsToKeep.clear();

		// Clear conversion API.
		( this.conversionApi as any ).writer = null;
		this.conversionApi.store = null;

		// Return fragment as conversion result.
		return documentFragment;
	}

	/**
	 * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#convertItem
	 */
	private _convertItem( viewItem: ViewItem | ViewDocumentFragment, modelCursor: ModelPosition ): {
		modelRange: ModelRange | null;
		modelCursor: ModelPosition;
	} {
		const data: UpcastConversionData = { viewItem, modelCursor, modelRange: null };

		if ( viewItem.is( 'element' ) ) {
			this.fire<UpcastElementEvent>(
				`element:${ viewItem.name }`,
				data as UpcastConversionData<ViewElement>,
				this.conversionApi
			);
		} else if ( viewItem.is( '$text' ) ) {
			this.fire<UpcastTextEvent>(
				'text',
				data as UpcastConversionData<ViewText>,
				this.conversionApi
			);
		} else {
			this.fire<UpcastDocumentFragmentEvent>(
				'documentFragment',
				data as UpcastConversionData<ViewDocumentFragment>,
				this.conversionApi
			);
		}

		// Handle incorrect conversion result.
		if ( data.modelRange && !( data.modelRange instanceof ModelRange ) ) {
			/**
			 * Incorrect conversion result was dropped.
			 *
			 * {@link module:engine/model/range~Range Model range} should be a conversion result.
			 *
			 * @error view-conversion-dispatcher-incorrect-result
			 */
			throw new CKEditorError( 'view-conversion-dispatcher-incorrect-result', this );
		}

		return { modelRange: data.modelRange, modelCursor: data.modelCursor };
	}

	/**
	 * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#convertChildren
	 */
	private _convertChildren(
		viewItem: ViewElement | ViewDocumentFragment,
		elementOrModelCursor: ModelPosition | ModelElement
	): {
			modelRange: ModelRange;
			modelCursor: ModelPosition;
		} {
		let nextModelCursor = elementOrModelCursor.is( 'position' ) ?
			elementOrModelCursor : ModelPosition._createAt( elementOrModelCursor, 0 );

		const modelRange = new ModelRange( nextModelCursor );

		for ( const viewChild of Array.from( viewItem.getChildren() ) ) {
			const result = this._convertItem( viewChild, nextModelCursor );

			if ( result.modelRange instanceof ModelRange ) {
				( modelRange as any ).end = result.modelRange.end;
				nextModelCursor = result.modelCursor;
			}
		}

		return { modelRange, modelCursor: nextModelCursor };
	}

	/**
	 * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#safeInsert
	 */
	private _safeInsert(
		modelNode: ModelNode,
		position: ModelPosition
	): boolean {
		// Find allowed parent for element that we are going to insert.
		// If current parent does not allow to insert element but one of the ancestors does
		// then split nodes to allowed parent.
		const splitResult = this._splitToAllowedParent( modelNode, position );

		// When there is no split result it means that we can't insert element to model tree, so let's skip it.
		if ( !splitResult ) {
			return false;
		}

		// Insert element on allowed position.
		this.conversionApi.writer.insert( modelNode, splitResult.position );

		return true;
	}

	/**
	 * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#updateConversionResult
	 */
	private _updateConversionResult( modelElement: ModelElement, data: UpcastConversionData ): void {
		const parts = this._getSplitParts( modelElement );

		const writer = this.conversionApi.writer!;

		// Set conversion result range - only if not set already.
		if ( !data.modelRange ) {
			data.modelRange = writer.createRange(
				writer.createPositionBefore( modelElement ),
				writer.createPositionAfter( parts[ parts.length - 1 ] )
			);
		}

		const savedCursorParent = this._cursorParents.get( modelElement );

		// Now we need to check where the `modelCursor` should be.
		if ( savedCursorParent ) {
			// If we split parent to insert our element then we want to continue conversion in the new part of the split parent.
			//
			// before: <allowed><notAllowed>foo[]</notAllowed></allowed>
			// after:  <allowed><notAllowed>foo</notAllowed> <converted></converted> <notAllowed>[]</notAllowed></allowed>

			data.modelCursor = writer.createPositionAt( savedCursorParent, 0 );
		} else {
			// Otherwise just continue after inserted element.

			data.modelCursor = data.modelRange.end;
		}
	}

	/**
	 * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#splitToAllowedParent
	 */
	private _splitToAllowedParent( node: ModelNode, modelCursor: ModelPosition ): {
		position: ModelPosition;
		cursorParent?: ModelElement | ModelDocumentFragment;
	} | null {
		const { schema, writer } = this.conversionApi;

		// Try to find allowed parent.
		let allowedParent = schema.findAllowedParent( modelCursor, node );

		if ( allowedParent ) {
			// When current position parent allows to insert node then return this position.
			if ( allowedParent === modelCursor.parent ) {
				return { position: modelCursor };
			}

			// When allowed parent is in context tree (it's outside the converted tree).
			if ( this._modelCursor!.parent.getAncestors().includes( allowedParent ) ) {
				allowedParent = null;
			}
		}

		if ( !allowedParent ) {
			// Check if the node wrapped with a paragraph would be accepted by the schema.
			if ( !isParagraphable( modelCursor, node, schema ) ) {
				return null;
			}

			return {
				position: wrapInParagraph( modelCursor, writer! )
			};
		}

		// Split element to allowed parent.
		const splitResult = this.conversionApi.writer!.split( modelCursor, allowedParent );

		// Using the range returned by `model.Writer#split`, we will pair original elements with their split parts.
		//
		// The range returned from the writer spans "over the split" or, precisely saying, from the end of the original element (the one
		// that got split) to the beginning of the other part of that element:
		//
		// <limit><a><b><c>X[]Y</c></b><a></limit> ->
		// <limit><a><b><c>X[</c></b></a><a><b><c>]Y</c></b></a>
		//
		// After the split there cannot be any full node between the positions in `splitRange`. The positions are touching.
		// Also, because of how splitting works, it is easy to notice, that "closing tags" are in the reverse order than "opening tags".
		// Also, since we split all those elements, each of them has to have the other part.
		//
		// With those observations in mind, we will pair the original elements with their split parts by saving "closing tags" and matching
		// them with "opening tags" in the reverse order. For that we can use a stack.
		const stack: Array<ModelElement> = [];

		for ( const treeWalkerValue of splitResult.range.getWalker() ) {
			if ( treeWalkerValue.type == 'elementEnd' ) {
				stack.push( treeWalkerValue.item as ModelElement );
			} else {
				// There should not be any text nodes after the element is split, so the only other value is `elementStart`.
				const originalPart = stack.pop();
				const splitPart = treeWalkerValue.item as ModelElement;

				this._registerSplitPair( originalPart!, splitPart );
			}
		}

		const cursorParent = splitResult.range.end.parent;
		this._cursorParents.set( node, cursorParent );

		return {
			position: splitResult.position,
			cursorParent
		};
	}

	/**
	 * Registers that a `splitPart` element is a split part of the `originalPart` element.
	 *
	 * The data set by this method is used by {@link #_getSplitParts} and {@link #_removeEmptyElements}.
	 */
	private _registerSplitPair( originalPart: ModelElement, splitPart: ModelElement ): void {
		if ( !this._splitParts.has( originalPart ) ) {
			this._splitParts.set( originalPart, [ originalPart ] );
		}

		const list = this._splitParts.get( originalPart )!;

		this._splitParts.set( splitPart, list );
		list.push( splitPart );
	}

	/**
	 * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#getSplitParts
	 */
	private _getSplitParts( element: ModelElement ): Array<ModelElement> {
		let parts: Array<ModelElement>;

		if ( !this._splitParts.has( element ) ) {
			parts = [ element ];
		} else {
			parts = this._splitParts.get( element )!;
		}

		return parts;
	}

	/**
	 * Mark an element that were created during the splitting to not get removed on conversion end even if it is empty.
	 */
	private _keepEmptyElement( element: ModelElement ): void {
		this._emptyElementsToKeep.add( element );
	}

	/**
	 * Checks if there are any empty elements created while splitting and removes them.
	 *
	 * This method works recursively to re-check empty elements again after at least one element was removed in the initial call,
	 * as some elements might have become empty after other empty elements were removed from them.
	 */
	private _removeEmptyElements(): void {
		// For every parent, prepare an array of children (empty elements) to remove from it.
		// Then, in next step, we will remove all children together, which is faster than removing them one by one.
		const toRemove = new Map<ModelElement | ModelDocumentFragment, Array<ModelElement>>();

		for ( const element of this._splitParts.keys() ) {
			if ( element.isEmpty && !this._emptyElementsToKeep.has( element ) ) {
				const children = toRemove.get( element.parent! ) || [];

				children.push( element );
				this._splitParts.delete( element );

				toRemove.set( element.parent!, children );
			}
		}

		for ( const [ parent, children ] of toRemove ) {
			parent._removeChildrenArray( children );
		}

		if ( toRemove.size ) {
			this._removeEmptyElements();
		}
	}
}

/**
 * Fired before the first conversion event, at the beginning of the upcast (view-to-model conversion) process.
 *
 * @eventName ~UpcastDispatcher#viewCleanup
 * @param viewItem A part of the view to be converted.
 */
export type UpcastViewCleanupEvent = {
	name: 'viewCleanup';
	args: [ ViewElement | ViewDocumentFragment ];
};

export type UpcastEvent<TName extends string, TItem extends ViewItem | ViewDocumentFragment> = {
	name: TName | `${ TName }:${ string }`;
	args: [ data: UpcastConversionData<TItem>, conversionApi: UpcastConversionApi ];
};

/**
 * Conversion data.
 *
 * **Note:** Keep in mind that this object is shared by reference between all conversion callbacks that will be called.
 * This means that callbacks can override values if needed, and these values will be available in other callbacks.
 */
export interface UpcastConversionData<TItem extends ViewItem | ViewDocumentFragment = ViewItem | ViewDocumentFragment> {

	/**
	 * The converted item.
	 */
	viewItem: TItem;

	/**
	 * The position where the converter should start changes.
	 * Change this value for the next converter to tell where the conversion should continue.
	 */
	modelCursor: ModelPosition;

	/**
	 * The current state of conversion result. Every change to
	 * the converted element should be reflected by setting or modifying this property.
	 */
	modelRange: ModelRange | null;
}

/**
 * Fired when an {@link module:engine/view/element~Element} is converted.
 *
 * `element` is a namespace event for a class of events. Names of actually called events follow the pattern of
 * `element:<elementName>` where `elementName` is the name of the converted element. This way listeners may listen to
 * a conversion of all or just specific elements.
 *
 * @eventName ~UpcastDispatcher#element
 * @param data The conversion data. Keep in mind that this object is shared by reference between all callbacks
 * that will be called. This means that callbacks can override values if needed, and these values
 * will be available in other callbacks.
 * @param conversionApi Conversion utilities to be used by the callback.
 */
export type UpcastElementEvent = UpcastEvent<'element', ViewElement>;

/**
 * Fired when a {@link module:engine/view/text~Text} is converted.
 *
 * @eventName ~UpcastDispatcher#text
 * @see ~UpcastDispatcher#event:element
 */
export type UpcastTextEvent = UpcastEvent<'text', ViewText>;

/**
 * Fired when a {@link module:engine/view/documentfragment~DocumentFragment} is converted.
 *
 * @eventName ~UpcastDispatcher#documentFragment
 * @see ~UpcastDispatcher#event:element
 */
export type UpcastDocumentFragmentEvent = UpcastEvent<'documentFragment', ViewDocumentFragment>;

/**
 * Traverses given model item and searches elements which marks marker range. Found element is removed from
 * DocumentFragment but path of this element is stored in a Map which is then returned.
 *
 * @param modelItem Fragment of model.
 * @returns List of static markers.
 */
function extractMarkersFromModelFragment( modelItem: ModelDocumentFragment, writer: ModelWriter ): Map<string, ModelRange> {
	const markerElements = new Set<ModelElement>();
	const markers = new Map<string, ModelRange>();

	// Create ModelTreeWalker.
	const range = ModelRange._createIn( modelItem ).getItems();

	// Walk through DocumentFragment and collect marker elements.
	for ( const item of range ) {
		// Check if current element is a marker.
		if ( item.is( 'element', '$marker' ) ) {
			markerElements.add( item );
		}
	}

	// Walk through collected marker elements store its path and remove its from the DocumentFragment.
	for ( const markerElement of markerElements ) {
		const markerName = markerElement.getAttribute( 'data-name' ) as string;
		const currentPosition = writer.createPositionBefore( markerElement );

		// When marker of given name is not stored it means that we have found the beginning of the range.
		if ( !markers.has( markerName ) ) {
			markers.set( markerName, new ModelRange( currentPosition.clone() ) );
		// Otherwise is means that we have found end of the marker range.
		} else {
			( markers.get( markerName ) as any ).end = currentPosition.clone();
		}

		// Remove marker element from DocumentFragment.
		writer.remove( markerElement );
	}

	return markers;
}

/**
 * Creates model fragment according to given context and returns position in the bottom (the deepest) element.
 */
function createContextTree(
	contextDefinition: SchemaContextDefinition,
	writer: ModelWriter
): ModelPosition | undefined {
	let position: ModelPosition | undefined;

	for ( const item of new SchemaContext( contextDefinition ) ) {
		const attributes: Record<string, unknown> = {};

		for ( const key of item.getAttributeKeys() ) {
			attributes[ key ] = item.getAttribute( key );
		}

		const current = writer.createElement( item.name, attributes );

		if ( position ) {
			writer.insert( current, position );
		}

		position = ModelPosition._createAt( current, 0 );
	}

	return position;
}

/**
 * A set of conversion utilities available as the third parameter of the
 * {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher upcast dispatcher}'s events.
 */
export interface UpcastConversionApi {

	/**
	 * Stores information about what parts of the processed view item are still waiting to be handled. After a piece of view item
	 * was converted, an appropriate consumable value should be
	 * {@link module:engine/conversion/viewconsumable~ViewConsumable#consume consumed}.
	 */
	consumable: ViewConsumable;

	/**
	 * The model's schema instance.
	 */
	schema: Schema;

	/**
	 * The {@link module:engine/model/writer~Writer} instance used to manipulate the data during conversion.
	 */
	writer: ModelWriter;

	/**
	 * Custom data stored by converters for the conversion process. Custom properties of this object can be defined and use to
	 * pass parameters between converters.
	 *
	 * The difference between this property and the `data` parameter of
	 * {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element} is that the `data` parameters allow you
	 * to pass parameters within a single event and `store` within the whole conversion.
	 */
	store: unknown;

	/**
	 * Starts the conversion of a given item by firing an appropriate event.
	 *
	 * Every fired event is passed (as the first parameter) an object with the `modelRange` property. Every event may set and/or
	 * modify that property. When all callbacks are done, the final value of the `modelRange` property is returned by this method.
	 * The `modelRange` must be a {@link module:engine/model/range~Range model range} or `null` (as set by default).
	 *
	 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
	 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:text
	 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:documentFragment
	 * @param viewItem Item to convert.
	 * @param modelCursor The conversion position.
	 * @returns The conversion result:
	 * * `result.modelRange` The model range containing the result of the item conversion,
	 * created and modified by callbacks attached to the fired event, or `null` if the conversion result was incorrect.
	 * * `result.modelCursor` The position where the conversion should be continued.
	 */
	convertItem( viewItem: ViewItem, modelCursor: ModelPosition ): {
		modelRange: ModelRange | null;
		modelCursor: ModelPosition;
	};

	/**
	 * Starts the conversion of all children of a given item by firing appropriate events for all the children.
	 *
	 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
	 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:text
	 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:documentFragment
	 * @param viewElement An element whose children should be converted.
	 * @param positionOrElement A position or an element of
	 * the conversion.
	 * @returns The conversion result:
	 * * `result.modelRange` The model range containing the results of the conversion of all children
	 * of the given item. When no child was converted, the range is collapsed.
	 * * `result.modelCursor` The position where the conversion should be continued.
	 */
	convertChildren( viewElement: ViewElement | ViewDocumentFragment, positionOrElement: ModelPosition | ModelElement ): {
		modelRange: ModelRange | null;
		modelCursor: ModelPosition;
	};

	/**
	 * Safely inserts an element to the document, checking the {@link module:engine/model/schema~Schema schema} to find an allowed parent
	 * for an element that you are going to insert, starting from the given position. If the current parent does not allow to insert
	 * the element but one of the ancestors does, then splits the nodes to allowed parent.
	 *
	 * If the schema allows to insert the node in a given position, nothing is split.
	 *
	 * If it was not possible to find an allowed parent, `false` is returned and nothing is split.
	 *
	 * Otherwise, ancestors are split.
	 *
	 * For instance, if `<imageBlock>` is not allowed in `<paragraph>` but is allowed in `$root`:
	 *
	 * ```
	 * <paragraph>foo[]bar</paragraph>
	 *
	 * -> safe insert for `<imageBlock>` will split ->
	 *
	 * <paragraph>foo</paragraph>[]<paragraph>bar</paragraph>
	 *```
	 *
	 * Example usage:
	 *
	 * ```
	 * const myElement = conversionApi.writer.createElement( 'myElement' );
	 *
	 * if ( !conversionApi.safeInsert( myElement, data.modelCursor ) ) {
	 * 	return;
	 * }
	 *```
	 *
	 * The split result is saved and {@link #updateConversionResult} should be used to update the
	 * {@link module:engine/conversion/upcastdispatcher~UpcastConversionData conversion data}.
	 *
	 * @param modelNode The node to insert.
	 * @param position The position where an element is going to be inserted.
	 * @returns The split result. If it was not possible to find an allowed position, `false` is returned.
	 */
	safeInsert( modelNode: ModelNode, position: ModelPosition ): boolean;

	/**
	 * Updates the conversion result and sets a proper {@link module:engine/conversion/upcastdispatcher~UpcastConversionData#modelRange} and
	 * the next {@link module:engine/conversion/upcastdispatcher~UpcastConversionData#modelCursor} after the conversion.
	 * Used together with {@link #safeInsert}, it enables you to easily convert elements without worrying if the node was split
	 * during the conversion of its children.
	 *
	 * A usage example in converter code:
	 *
	 * ```ts
	 * const myElement = conversionApi.writer.createElement( 'myElement' );
	 *
	 * if ( !conversionApi.safeInsert( myElement, data.modelCursor ) ) {
	 * 	return;
	 * }
	 *
	 * // Children conversion may split `myElement`.
	 * conversionApi.convertChildren( data.viewItem, myElement );
	 *
	 * conversionApi.updateConversionResult( myElement, data );
	 * ```
	 */
	updateConversionResult( modelElement: ModelElement, data: UpcastConversionData ): void;

	/**
	 * Checks the {@link module:engine/model/schema~Schema schema} to find an allowed parent for an element that is going to be inserted
	 * starting from the given position. If the current parent does not allow inserting an element but one of the ancestors does, the method
	 * splits nodes to allowed parent.
	 *
	 * If the schema allows inserting the node in the given position, nothing is split and an object with that position is returned.
	 *
	 * If it was not possible to find an allowed parent, `null` is returned and nothing is split.
	 *
	 * Otherwise, ancestors are split and an object with a position and the copy of the split element is returned.
	 *
	 * For instance, if `<imageBlock>` is not allowed in `<paragraph>` but is allowed in `$root`:
	 *
	 * ```
	 * <paragraph>foo[]bar</paragraph>
	 *
	 * -> split for `<imageBlock>` ->
	 *
	 * <paragraph>foo</paragraph>[]<paragraph>bar</paragraph>
	 * ```
	 *
	 * In the example above, the position between `<paragraph>` elements will be returned as `position` and the second `paragraph`
	 * as `cursorParent`.
	 *
	 * **Note:** This is an advanced method. For most cases {@link #safeInsert} and {@link #updateConversionResult} should be used.
	 *
	 * @param modelNode The node to insert.
	 * @param modelCursor The position where the element is going to be inserted.
	 * @returns The split result. If it was not possible to find an allowed position, `null` is returned.
	 * * `position` The position between split elements.
	 * * `cursorParent` The element inside which the cursor should be placed to
	 * continue the conversion. When the element is not defined it means that there was no split.
	 */
	splitToAllowedParent( modelNode: ModelNode, modelCursor: ModelPosition ): {
		position: ModelPosition;
		cursorParent?: ModelElement | ModelDocumentFragment;
	} | null;

	/**
	 * Returns all the split parts of the given `element` that were created during upcasting through using {@link #splitToAllowedParent}.
	 * It enables you to easily track these elements and continue processing them after they are split during the conversion of their
	 * children.
	 *
	 * ```
	 * <paragraph>Foo<imageBlock />bar<imageBlock />baz</paragraph> ->
	 * <paragraph>Foo</paragraph><imageBlock /><paragraph>bar</paragraph><imageBlock /><paragraph>baz</paragraph>
	 * ```
	 *
	 * For a reference to any of above paragraphs, the function will return all three paragraphs (the original element included),
	 * sorted in the order of their creation (the original element is the first one).
	 *
	 * If the given `element` was not split, an array with a single element is returned.
	 *
	 * A usage example in the converter code:
	 *
	 * ```ts
	 * const myElement = conversionApi.writer.createElement( 'myElement' );
	 *
	 * // Children conversion may split `myElement`.
	 * conversionApi.convertChildren( data.viewItem, data.modelCursor );
	 *
	 * const splitParts = conversionApi.getSplitParts( myElement );
	 * const lastSplitPart = splitParts[ splitParts.length - 1 ];
	 *
	 * // Setting `data.modelRange` basing on split parts:
	 * data.modelRange = conversionApi.writer.createRange(
	 * 	conversionApi.writer.createPositionBefore( myElement ),
	 * 	conversionApi.writer.createPositionAfter( lastSplitPart )
	 * );
	 *
	 * // Setting `data.modelCursor` to continue after the last split element:
	 * data.modelCursor = conversionApi.writer.createPositionAfter( lastSplitPart );
	 * ```
	 *
	 * **Tip:** If you are unable to get a reference to the original element (for example because the code is split into multiple converters
	 * or even classes) but it has already been converted, you may want to check the first element in `data.modelRange`. This is a common
	 * situation if an attribute converter is separated from an element converter.
	 *
	 * **Note:** This is an advanced method. For most cases {@link #safeInsert} and {@link #updateConversionResult} should be used.
	 */
	getSplitParts( modelElement: ModelElement ): Array<ModelElement>;

	/**
	 * Mark an element that was created during splitting to not get removed on conversion end even if it is empty.
	 *
	 * **Note:** This is an advanced method. For most cases you will not need to keep the split empty element.
	 */
	keepEmptyElement( modelElement: ModelElement ): void;
}
