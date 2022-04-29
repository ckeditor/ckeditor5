/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/conversion/upcastdispatcher
 */

import ViewConsumable from './viewconsumable';
import ModelRange from '../model/range';
import ModelPosition from '../model/position';
import { SchemaContext } from '../model/schema';
import { isParagraphable, wrapInParagraph } from '../model/utils/autoparagraphing';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

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
 * You can read more about conversion in the {@glink framework/guides/deep-dive/conversion/upcast Upcast conversion} guide.
 *
 * Examples of event-based converters:
 *
 *		// A converter for links (<a>).
 *		editor.data.upcastDispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
 *			if ( conversionApi.consumable.consume( data.viewItem, { name: true, attributes: [ 'href' ] } ) ) {
 *				// The <a> element is inline and is represented by an attribute in the model.
 *				// This is why you need to convert only children.
 *				const { modelRange } = conversionApi.convertChildren( data.viewItem, data.modelCursor );
 *
 *				for ( let item of modelRange.getItems() ) {
 *					if ( conversionApi.schema.checkAttribute( item, 'linkHref' ) ) {
 *						conversionApi.writer.setAttribute( 'linkHref', data.viewItem.getAttribute( 'href' ), item );
 *					}
 *				}
 *			}
 *		} );
 *
 *		// Convert <p> element's font-size style.
 *		// Note: You should use a low-priority observer in order to ensure that
 *		// it is executed after the element-to-element converter.
 *		editor.data.upcastDispatcher.on( 'element:p', ( evt, data, conversionApi ) => {
 *			const { consumable, schema, writer } = conversionApi;
 *
 *			if ( !consumable.consume( data.viewItem, { style: 'font-size' } ) ) {
 *				return;
 *			}
 *
 *			const fontSize = data.viewItem.getStyle( 'font-size' );
 *
 *			// Do not go for the model element after data.modelCursor because it might happen
 *			// that a single view element was converted to multiple model elements. Get all of them.
 *			for ( const item of data.modelRange.getItems( { shallow: true } ) ) {
 *				if ( schema.checkAttribute( item, 'fontSize' ) ) {
 *					writer.setAttribute( 'fontSize', fontSize, item );
 *				}
 *			}
 *		}, { priority: 'low' } );
 *
 *		// Convert all elements which have no custom converter into a paragraph (autoparagraphing).
 *		editor.data.upcastDispatcher.on( 'element', ( evt, data, conversionApi ) => {
 *			// Check if an element can be converted.
 *			if ( !conversionApi.consumable.test( data.viewItem, { name: data.viewItem.name } ) ) {
 *				// When an element is already consumed by higher priority converters, do nothing.
 *				return;
 *			}
 *
 *			const paragraph = conversionApi.writer.createElement( 'paragraph' );
 *
 *			// Try to safely insert a paragraph at the model cursor - it will find an allowed parent for the current element.
 *			if ( !conversionApi.safeInsert( paragraph, data.modelCursor ) ) {
 *				// When an element was not inserted, it means that you cannot insert a paragraph at this position.
 *				return;
 *			}
 *
 *			// Consume the inserted element.
 *			conversionApi.consumable.consume( data.viewItem, { name: data.viewItem.name } ) );
 *
 *			// Convert the children to a paragraph.
 *			const { modelRange } = conversionApi.convertChildren( data.viewItem,  paragraph ) );
 *
 *			// Update `modelRange` and `modelCursor` in the `data` as a conversion result.
 *			conversionApi.updateConversionResult( paragraph, data );
 *		}, { priority: 'low' } );
 *
 * @mixes module:utils/emittermixin~EmitterMixin
 * @fires viewCleanup
 * @fires element
 * @fires text
 * @fires documentFragment
 */
export default class UpcastDispatcher {
	/**
	 * Creates an upcast dispatcher that operates using the passed API.
	 *
	 * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi
	 * @param {Object} [conversionApi] Additional properties for an interface that will be passed to events fired
	 * by the upcast dispatcher.
	 */
	constructor( conversionApi = {} ) {
		/**
		 * The list of elements that were created during splitting.
		 *
		 * After the conversion process, the list is cleared.
		 *
		 * @private
		 * @type {Map.<module:engine/model/element~Element,Array.<module:engine/model/element~Element>>}
		 */
		this._splitParts = new Map();

		/**
		 * The list of cursor parent elements that were created during splitting.
		 *
		 * After the conversion process the list is cleared.
		 *
		 * @private
		 * @type {Map.<module:engine/model/element~Element,Array.<module:engine/model/element~Element>>}
		 */
		this._cursorParents = new Map();

		/**
		 * The position in the temporary structure where the converted content is inserted. The structure reflects the context of
		 * the target position where the content will be inserted. This property is built based on the context parameter of the
		 * convert method.
		 *
		 * @private
		 * @type {module:engine/model/position~Position|null}
		 */
		this._modelCursor = null;

		/**
		 * The list of elements that were created during the splitting but should not get removed on conversion end even if they are empty.
		 *
		 * The list is cleared after the conversion process.
		 *
		 * @private
		 * @type {Set.<module:engine/model/element~Element>}
		 */
		this._emptyElementsToKeep = new Set();

		/**
		 * An interface passed by the dispatcher to the event callbacks.
		 *
		 * @member {module:engine/conversion/upcastdispatcher~UpcastConversionApi}
		 */
		this.conversionApi = Object.assign( {}, conversionApi );

		// The below methods are bound to this `UpcastDispatcher` instance and set on `conversionApi`.
		// This way only a part of `UpcastDispatcher` API is exposed.
		this.conversionApi.convertItem = this._convertItem.bind( this );
		this.conversionApi.convertChildren = this._convertChildren.bind( this );
		this.conversionApi.safeInsert = this._safeInsert.bind( this );
		this.conversionApi.updateConversionResult = this._updateConversionResult.bind( this );
		// Advanced API - use only if custom position handling is needed.
		this.conversionApi.splitToAllowedParent = this._splitToAllowedParent.bind( this );
		this.conversionApi.getSplitParts = this._getSplitParts.bind( this );
		this.conversionApi.keepEmptyElement = this._keepEmptyElement.bind( this );
	}

	/**
	 * Starts the conversion process. The entry point for the conversion.
	 *
	 * @fires element
	 * @fires text
	 * @fires documentFragment
	 * @param {module:engine/view/documentfragment~DocumentFragment|module:engine/view/element~Element} viewItem
	 * The part of the view to be converted.
	 * @param {module:engine/model/writer~Writer} writer An instance of the model writer.
	 * @param {module:engine/model/schema~SchemaContextDefinition} [context=['$root']] Elements will be converted according to this context.
	 * @returns {module:engine/model/documentfragment~DocumentFragment} Model data that is the result of the conversion process
	 * wrapped in `DocumentFragment`. Converted marker elements will be set as the document fragment's
	 * {@link module:engine/model/documentfragment~DocumentFragment#markers static markers map}.
	 */
	convert( viewItem, writer, context = [ '$root' ] ) {
		this.fire( 'viewCleanup', viewItem );

		// Create context tree and set position in the top element.
		// Items will be converted according to this position.
		this._modelCursor = createContextTree( context, writer );

		// Store writer in conversion as a conversion API
		// to be sure that conversion process will use the same batch.
		this.conversionApi.writer = writer;

		// Create consumable values list for conversion process.
		this.conversionApi.consumable = ViewConsumable.createFrom( viewItem );

		// Custom data stored by converter for conversion process.
		this.conversionApi.store = {};

		// Do the conversion.
		const { modelRange } = this._convertItem( viewItem, this._modelCursor );

		// Conversion result is always a document fragment so let's create it.
		const documentFragment = writer.createDocumentFragment();

		// When there is a conversion result.
		if ( modelRange ) {
			// Remove all empty elements that were create while splitting.
			this._removeEmptyElements();

			// Move all items that were converted in context tree to the document fragment.
			for ( const item of Array.from( this._modelCursor.parent.getChildren() ) ) {
				writer.append( item, documentFragment );
			}

			// Extract temporary markers elements from model and set as static markers collection.
			documentFragment.markers = extractMarkersFromModelFragment( documentFragment, writer );
		}

		// Clear context position.
		this._modelCursor = null;

		// Clear split elements & parents lists.
		this._splitParts.clear();
		this._cursorParents.clear();
		this._emptyElementsToKeep.clear();

		// Clear conversion API.
		this.conversionApi.writer = null;
		this.conversionApi.store = null;

		// Return fragment as conversion result.
		return documentFragment;
	}

	/**
	 * @private
	 * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#convertItem
	 */
	_convertItem( viewItem, modelCursor ) {
		const data = Object.assign( { viewItem, modelCursor, modelRange: null } );

		if ( viewItem.is( 'element' ) ) {
			this.fire( 'element:' + viewItem.name, data, this.conversionApi );
		} else if ( viewItem.is( '$text' ) ) {
			this.fire( 'text', data, this.conversionApi );
		} else {
			this.fire( 'documentFragment', data, this.conversionApi );
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
	 * @private
	 * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#convertChildren
	 */
	_convertChildren( viewItem, elementOrModelCursor ) {
		let nextModelCursor = elementOrModelCursor.is( 'position' ) ?
			elementOrModelCursor : ModelPosition._createAt( elementOrModelCursor, 0 );

		const modelRange = new ModelRange( nextModelCursor );

		for ( const viewChild of Array.from( viewItem.getChildren() ) ) {
			const result = this._convertItem( viewChild, nextModelCursor );

			if ( result.modelRange instanceof ModelRange ) {
				modelRange.end = result.modelRange.end;
				nextModelCursor = result.modelCursor;
			}
		}

		return { modelRange, modelCursor: nextModelCursor };
	}

	/**
	 * @private
	 * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#safeInsert
	 */
	_safeInsert( modelElement, position ) {
		// Find allowed parent for element that we are going to insert.
		// If current parent does not allow to insert element but one of the ancestors does
		// then split nodes to allowed parent.
		const splitResult = this._splitToAllowedParent( modelElement, position );

		// When there is no split result it means that we can't insert element to model tree, so let's skip it.
		if ( !splitResult ) {
			return false;
		}

		// Insert element on allowed position.
		this.conversionApi.writer.insert( modelElement, splitResult.position );

		return true;
	}

	/**
	 * @private
	 * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#updateConversionResult
	 */
	_updateConversionResult( modelElement, data ) {
		const parts = this._getSplitParts( modelElement );

		const writer = this.conversionApi.writer;

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
	 * @private
	 * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#splitToAllowedParent
	 */
	_splitToAllowedParent( node, modelCursor ) {
		const { schema, writer } = this.conversionApi;

		// Try to find allowed parent.
		let allowedParent = schema.findAllowedParent( modelCursor, node );

		if ( allowedParent ) {
			// When current position parent allows to insert node then return this position.
			if ( allowedParent === modelCursor.parent ) {
				return { position: modelCursor };
			}

			// When allowed parent is in context tree (it's outside the converted tree).
			if ( this._modelCursor.parent.getAncestors().includes( allowedParent ) ) {
				allowedParent = null;
			}
		}

		if ( !allowedParent ) {
			// Check if the node wrapped with a paragraph would be accepted by the schema.
			if ( !isParagraphable( modelCursor, node, schema ) ) {
				return null;
			}

			return {
				position: wrapInParagraph( modelCursor, writer )
			};
		}

		// Split element to allowed parent.
		const splitResult = this.conversionApi.writer.split( modelCursor, allowedParent );

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
		const stack = [];

		for ( const treeWalkerValue of splitResult.range.getWalker() ) {
			if ( treeWalkerValue.type == 'elementEnd' ) {
				stack.push( treeWalkerValue.item );
			} else {
				// There should not be any text nodes after the element is split, so the only other value is `elementStart`.
				const originalPart = stack.pop();
				const splitPart = treeWalkerValue.item;

				this._registerSplitPair( originalPart, splitPart );
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
	 *
	 * @private
	 * @param {module:engine/model/element~Element} originalPart
	 * @param {module:engine/model/element~Element} splitPart
	 */
	_registerSplitPair( originalPart, splitPart ) {
		if ( !this._splitParts.has( originalPart ) ) {
			this._splitParts.set( originalPart, [ originalPart ] );
		}

		const list = this._splitParts.get( originalPart );

		this._splitParts.set( splitPart, list );
		list.push( splitPart );
	}

	/**
	 * @private
	 * @see module:engine/conversion/upcastdispatcher~UpcastConversionApi#getSplitParts
	 */
	_getSplitParts( element ) {
		let parts;

		if ( !this._splitParts.has( element ) ) {
			parts = [ element ];
		} else {
			parts = this._splitParts.get( element );
		}

		return parts;
	}

	/**
	 * Mark an element that were created during the splitting to not get removed on conversion end even if it is empty.
	 *
	 * @private
	 */
	_keepEmptyElement( element ) {
		this._emptyElementsToKeep.add( element );
	}

	/**
	 * Checks if there are any empty elements created while splitting and removes them.
	 *
	 * This method works recursively to re-check empty elements again after at least one element was removed in the initial call,
	 * as some elements might have become empty after other empty elements were removed from them.
	 *
	 * @private
	 */
	_removeEmptyElements() {
		let anyRemoved = false;

		for ( const element of this._splitParts.keys() ) {
			if ( element.isEmpty && !this._emptyElementsToKeep.has( element ) ) {
				this.conversionApi.writer.remove( element );
				this._splitParts.delete( element );

				anyRemoved = true;
			}
		}

		if ( anyRemoved ) {
			this._removeEmptyElements();
		}
	}

	/**
	 * Fired before the first conversion event, at the beginning of the upcast (view-to-model conversion) process.
	 *
	 * @event viewCleanup
	 * @param {module:engine/view/documentfragment~DocumentFragment|module:engine/view/element~Element}
	 * viewItem A part of the view to be converted.
	 */

	/**
	 * Fired when an {@link module:engine/view/element~Element} is converted.
	 *
	 * `element` is a namespace event for a class of events. Names of actually called events follow the pattern of
	 * `element:<elementName>` where `elementName` is the name of the converted element. This way listeners may listen to
	 * a conversion of all or just specific elements.
	 *
	 * @event element
	 * @param {module:engine/conversion/upcastdispatcher~UpcastConversionData} data The conversion data. Keep in mind that this object is
	 * shared by reference between all callbacks that will be called. This means that callbacks can override values if needed, and these
	 * values will be available in other callbacks.
	 * @param {module:engine/conversion/upcastdispatcher~UpcastConversionApi} conversionApi Conversion utilities to be used by the
	 * callback.
	 */

	/**
	 * Fired when a {@link module:engine/view/text~Text} is converted.
	 *
	 * @event text
	 * @see #event:element
	 */

	/**
	 * Fired when a {@link module:engine/view/documentfragment~DocumentFragment} is converted.
	 *
	 * @event documentFragment
	 * @see #event:element
	 */
}

mix( UpcastDispatcher, EmitterMixin );

// Traverses given model item and searches elements which marks marker range. Found element is removed from
// DocumentFragment but path of this element is stored in a Map which is then returned.
//
// @param {module:engine/view/documentfragment~DocumentFragment|module:engine/view/node~Node} modelItem Fragment of model.
// @returns {Map<String, module:engine/model/range~Range>} List of static markers.
function extractMarkersFromModelFragment( modelItem, writer ) {
	const markerElements = new Set();
	const markers = new Map();

	// Create ModelTreeWalker.
	const range = ModelRange._createIn( modelItem ).getItems();

	// Walk through DocumentFragment and collect marker elements.
	for ( const item of range ) {
		// Check if current element is a marker.
		if ( item.name == '$marker' ) {
			markerElements.add( item );
		}
	}

	// Walk through collected marker elements store its path and remove its from the DocumentFragment.
	for ( const markerElement of markerElements ) {
		const markerName = markerElement.getAttribute( 'data-name' );
		const currentPosition = writer.createPositionBefore( markerElement );

		// When marker of given name is not stored it means that we have found the beginning of the range.
		if ( !markers.has( markerName ) ) {
			markers.set( markerName, new ModelRange( currentPosition.clone() ) );
		// Otherwise is means that we have found end of the marker range.
		} else {
			markers.get( markerName ).end = currentPosition.clone();
		}

		// Remove marker element from DocumentFragment.
		writer.remove( markerElement );
	}

	return markers;
}

// Creates model fragment according to given context and returns position in the bottom (the deepest) element.
function createContextTree( contextDefinition, writer ) {
	let position;

	for ( const item of new SchemaContext( contextDefinition ) ) {
		const attributes = {};

		for ( const key of item.getAttributeKeys() ) {
			attributes[ key ] = item.getAttribute( key );
		}

		const current = writer.createElement( item.name, attributes );

		if ( position ) {
			writer.append( current, position );
		}

		position = ModelPosition._createAt( current, 0 );
	}

	return position;
}

/**
 * A set of conversion utilities available as the third parameter of the
 * {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher upcast dispatcher}'s events.
 *
 * @interface module:engine/conversion/upcastdispatcher~UpcastConversionApi
 */

/**
 * Starts the conversion of a given item by firing an appropriate event.
 *
 * Every fired event is passed (as the first parameter) an object with the `modelRange` property. Every event may set and/or
 * modify that property. When all callbacks are done, the final value of the `modelRange` property is returned by this method.
 * The `modelRange` must be a {@link module:engine/model/range~Range model range} or `null` (as set by default).
 *
 * @method #convertItem
 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:text
 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:documentFragment
 * @param {module:engine/view/item~Item} viewItem Item to convert.
 * @param {module:engine/model/position~Position} modelCursor The conversion position.
 * @returns {Object} result The conversion result.
 * @returns {module:engine/model/range~Range|null} result.modelRange The model range containing the result of the item conversion,
 * created and modified by callbacks attached to the fired event, or `null` if the conversion result was incorrect.
 * @returns {module:engine/model/position~Position} result.modelCursor The position where the conversion should be continued.
 */

/**
 * Starts the conversion of all children of a given item by firing appropriate events for all the children.
 *
 * @method #convertChildren
 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:text
 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:documentFragment
 * @param {module:engine/view/item~Item} viewItem An element whose children should be converted.
 * @param {module:engine/model/position~Position|module:engine/model/element~Element} positionOrElement A position or an element of
 * the conversion.
 * @returns {Object} result The conversion result.
 * @returns {module:engine/model/range~Range} result.modelRange The model range containing the results of the conversion of all children
 * of the given item. When no child was converted, the range is collapsed.
 * @returns {module:engine/model/position~Position} result.modelCursor The position where the conversion should be continued.
 */

/**
 * Safely inserts an element to the document, checking the {@link module:engine/model/schema~Schema schema} to find an allowed parent for
 * an element that you are going to insert, starting from the given position. If the current parent does not allow to insert the element
 * but one of the ancestors does, then splits the nodes to allowed parent.
 *
 * If the schema allows to insert the node in a given position, nothing is split.
 *
 * If it was not possible to find an allowed parent, `false` is returned and nothing is split.
 *
 * Otherwise, ancestors are split.
 *
 * For instance, if `<imageBlock>` is not allowed in `<paragraph>` but is allowed in `$root`:
 *
 *		<paragraph>foo[]bar</paragraph>
 *
 *		-> safe insert for `<imageBlock>` will split ->
 *
 *		<paragraph>foo</paragraph>[]<paragraph>bar</paragraph>
 *
 * Example usage:
 *
 *		const myElement = conversionApi.writer.createElement( 'myElement' );
 *
 *		if ( !conversionApi.safeInsert( myElement, data.modelCursor ) ) {
 *			return;
 *		}
 *
 * The split result is saved and {@link #updateConversionResult} should be used to update the
 * {@link module:engine/conversion/upcastdispatcher~UpcastConversionData conversion data}.
 *
 * @method #safeInsert
 * @param {module:engine/model/node~Node} node The node to insert.
 * @param {module:engine/model/position~Position} position The position where an element is going to be inserted.
 * @returns {Boolean} The split result. If it was not possible to find an allowed position, `false` is returned.
 */

/**
 * Updates the conversion result and sets a proper {@link module:engine/conversion/upcastdispatcher~UpcastConversionData#modelRange} and
 * the next {@link module:engine/conversion/upcastdispatcher~UpcastConversionData#modelCursor} after the conversion.
 * Used together with {@link #safeInsert}, it enables you to easily convert elements without worrying if the node was split
 * during the conversion of its children.
 *
 * A usage example in converter code:
 *
 *		const myElement = conversionApi.writer.createElement( 'myElement' );
 *
 *		if ( !conversionApi.safeInsert( myElement, data.modelCursor ) ) {
 *			return;
 *		}
 *
 *		// Children conversion may split `myElement`.
 *		conversionApi.convertChildren( data.viewItem, myElement );
 *
 *		conversionApi.updateConversionResult( myElement, data );
 *
 * @method #updateConversionResult
 * @param {module:engine/model/element~Element} element
 * @param {module:engine/conversion/upcastdispatcher~UpcastConversionData} data Conversion data.
 * @param {module:engine/conversion/upcastdispatcher~UpcastConversionApi} conversionApi Conversion utilities to be used by the callback.
 */

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
 *		<paragraph>foo[]bar</paragraph>
 *
 *		-> split for `<imageBlock>` ->
 *
 *		<paragraph>foo</paragraph>[]<paragraph>bar</paragraph>
 *
 * In the example above, the position between `<paragraph>` elements will be returned as `position` and the second `paragraph`
 * as `cursorParent`.
 *
 * **Note:** This is an advanced method. For most cases {@link #safeInsert} and {@link #updateConversionResult} should be used.
 *
 * @method #splitToAllowedParent
 * @param {module:engine/model/position~Position} position The position where the element is going to be inserted.
 * @param {module:engine/model/node~Node} node The node to insert.
 * @returns {Object|null} The split result. If it was not possible to find an allowed position, `null` is returned.
 * @returns {module:engine/model/position~Position} The position between split elements.
 * @returns {module:engine/model/element~Element} [cursorParent] The element inside which the cursor should be placed to
 * continue the conversion. When the element is not defined it means that there was no split.
 */

/**
 * Returns all the split parts of the given `element` that were created during upcasting through using {@link #splitToAllowedParent}.
 * It enables you to easily track these elements and continue processing them after they are split during the conversion of their children.
 *
 *		<paragraph>Foo<imageBlock />bar<imageBlock />baz</paragraph> ->
 *		<paragraph>Foo</paragraph><imageBlock /><paragraph>bar</paragraph><imageBlock /><paragraph>baz</paragraph>
 *
 * For a reference to any of above paragraphs, the function will return all three paragraphs (the original element included),
 * sorted in the order of their creation (the original element is the first one).
 *
 * If the given `element` was not split, an array with a single element is returned.
 *
 * A usage example in the converter code:
 *
 *		const myElement = conversionApi.writer.createElement( 'myElement' );
 *
 *		// Children conversion may split `myElement`.
 *		conversionApi.convertChildren( data.viewItem, data.modelCursor );
 *
 *		const splitParts = conversionApi.getSplitParts( myElement );
 *		const lastSplitPart = splitParts[ splitParts.length - 1 ];
 *
 *		// Setting `data.modelRange` basing on split parts:
 *		data.modelRange = conversionApi.writer.createRange(
 *			conversionApi.writer.createPositionBefore( myElement ),
 *			conversionApi.writer.createPositionAfter( lastSplitPart )
 *		);
 *
 *		// Setting `data.modelCursor` to continue after the last split element:
 *		data.modelCursor = conversionApi.writer.createPositionAfter( lastSplitPart );
 *
 * **Tip:** If you are unable to get a reference to the original element (for example because the code is split into multiple converters
 * or even classes) but it has already been converted, you may want to check the first element in `data.modelRange`. This is a common
 * situation if an attribute converter is separated from an element converter.
 *
 * **Note:** This is an advanced method. For most cases {@link #safeInsert} and {@link #updateConversionResult} should be used.
 *
 * @method #getSplitParts
 * @param {module:engine/model/element~Element} element
 * @returns {Array.<module:engine/model/element~Element>}
 */

/**
 * Mark an element that was created during splitting to not get removed on conversion end even if it is empty.
 *
 * **Note:** This is an advanced method. For most cases you will not need to keep the split empty element.
 *
 * @method #keepEmptyElement
 * @param {module:engine/model/element~Element} element
 */

/**
 * Stores information about what parts of the processed view item are still waiting to be handled. After a piece of view item
 * was converted, an appropriate consumable value should be
 * {@link module:engine/conversion/viewconsumable~ViewConsumable#consume consumed}.
 *
 * @member {module:engine/conversion/viewconsumable~ViewConsumable} #consumable
 */

/**
 * Custom data stored by converters for the conversion process. Custom properties of this object can be defined and use to
 * pass parameters between converters.
 *
 * The difference between this property and the `data` parameter of
 * {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element} is that the `data` parameters allow you
 * to pass parameters within a single event and `store` within the whole conversion.
 *
 * @member {Object} #store
 */

/**
 * The model's schema instance.
 *
 * @member {module:engine/model/schema~Schema} #schema
 */

/**
 * The {@link module:engine/model/writer~Writer} instance used to manipulate the data during conversion.
 *
 * @member {module:engine/model/writer~Writer} #writer
 */

/**
 * Conversion data.
 *
 * **Note:** Keep in mind that this object is shared by reference between all conversion callbacks that will be called.
 * This means that callbacks can override values if needed, and these values will be available in other callbacks.
 *
 * @typedef {Object} module:engine/conversion/upcastdispatcher~UpcastConversionData
 *
 * @property {module:engine/view/item~Item} viewItem The converted item.
 * @property {module:engine/model/position~Position} modelCursor The position where the converter should start changes.
 * Change this value for the next converter to tell where the conversion should continue.
 * @property {module:engine/model/range~Range} [modelRange] The current state of conversion result. Every change to
 * the converted element should be reflected by setting or modifying this property.
 */
