/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/conversion/upcastdispatcher
 */

import ViewConsumable from './viewconsumable';
import ModelRange from '../model/range';
import ModelPosition from '../model/position';
import { SchemaContext } from '../model/schema';

import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * `UpcastDispatcher` is a central point of {@link module:engine/view/view view} conversion, which is a process of
 * converting given {@link module:engine/view/documentfragment~DocumentFragment view document fragment} or
 * {@link module:engine/view/element~Element} into another structure.
 * In default application, {@link module:engine/view/view view} is converted to {@link module:engine/model/model}.
 *
 * During conversion process, for all {@link module:engine/view/node~Node view nodes} from the converted view document fragment,
 * `UpcastDispatcher` fires corresponding events. Special callbacks called "converters" should listen to
 * `UpcastDispatcher` for those events.
 *
 * Each callback, as the second argument, is passed a special object `data` that has `viewItem`, `modelCursor` and
 * `modelRange` properties. `viewItem` property contains {@link module:engine/view/node~Node view node} or
 * {@link module:engine/view/documentfragment~DocumentFragment view document fragment}
 * that is converted at the moment and might be handled by the callback. `modelRange` property should be used to save the result
 * of conversion and is always a {@link module:engine/model/range~Range} when conversion result is correct.
 * `modelCursor` property is a {@link module:engine/model/position~Position position} on which conversion result will be inserted
 * and is a context according to {@link module:engine/model/schema~Schema schema} will be checked before the conversion.
 * See also {@link ~UpcastDispatcher#convert}. It is also shared by reference by all callbacks listening to given event.
 *
 * The third parameter passed to a callback is an instance of {@link ~UpcastDispatcher}
 * which provides additional tools for converters.
 *
 * Examples of providing callbacks for `UpcastDispatcher`:
 *
 *		// Converter for links (<a>).
 *		upcastDispatcher.on( 'element:a', ( evt, data, conversionApi ) => {
 *			if ( conversionApi.consumable.consume( data.viewItem, { name: true, attributes: [ 'href' ] } ) ) {
 *				// <a> element is inline and is represented by an attribute in the model.
 *				// This is why we need to convert only children.
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
 *		// Convert all elements which have no custom converter into paragraph (autoparagraphing).
 *  	data.viewToModel.on( 'element', ( evt, data, conversionApi ) => {
 *  	 	// When element is already consumed by higher priority converters then do nothing.
 *  	 	if ( conversionApi.consumable.test( data.viewItem, { name: data.viewItem.name } ) ) {
 *  	 			const paragraph = conversionApi.writer.createElement( 'paragraph' );
 *
 *  	 			// Find allowed parent for paragraph that we are going to insert. If current parent does not allow
 *  	 			// to insert paragraph but one of the ancestors does then split nodes to allowed parent.
 *  	 			const splitResult = conversionApi.splitToAllowedParent( paragraph, data.modelCursor );
 *
 *  	 			// When there is no split result it means that we can't insert paragraph in this position.
 *  	 			if ( splitResult ) {
 *  	 				// Insert paragraph in allowed position.
 *  	 				conversionApi.writer.insert( paragraph, splitResult.position );
 *
 *  	 				// Convert children to paragraph.
 *  	 				const { modelRange } = conversionApi.convertChildren( data.viewItem, Position.createAt( paragraph ) );
 *
 * 						// Set as conversion result, attribute converters may use this property.
 *  	 				data.modelRange = new Range( Position.createBefore( paragraph ), modelRange.end );
 *
 *  	 				// Continue conversion inside paragraph.
 *  	 				data.modelCursor = data.modelRange.end;
 *  	 			}
 *  	 		}
 *  	 	}
 *  	 }, { priority: 'low' } );
 *
 * Before each conversion process, `UpcastDispatcher` fires {@link ~UpcastDispatcher#event:viewCleanup}
 * event which can be used to prepare tree view for conversion.
 *
 * @mixes module:utils/emittermixin~EmitterMixin
 * @fires viewCleanup
 * @fires element
 * @fires text
 * @fires documentFragment
 */
export default class UpcastDispatcher {
	/**
	 * Creates a `UpcastDispatcher` that operates using passed API.
	 *
	 * @see module:engine/conversion/upcastdispatcher~ViewConversionApi
	 * @param {Object} [conversionApi] Additional properties for interface that will be passed to events fired
	 * by `UpcastDispatcher`.
	 */
	constructor( conversionApi = {} ) {
		/**
		 * List of elements that will be checked after conversion process and if element in the list will be empty it
		 * will be removed from conversion result.
		 *
		 * After conversion process list is cleared.
		 *
		 * @protected
		 * @type {Set<module:engine/model/element~Element>}
		 */
		this._removeIfEmpty = new Set();

		/**
		 * Position in the temporary structure where the converted content is inserted. The structure reflect the context of
		 * the target position where the content will be inserted. This property is build based on the context parameter of the
		 * convert method.
		 *
		 * @private
		 * @type {module:engine/model/position~Position|null}
		 */
		this._modelCursor = null;

		/**
		 * Interface passed by dispatcher to the events callbacks.
		 *
		 * @member {module:engine/conversion/upcastdispatcher~ViewConversionApi}
		 */
		this.conversionApi = Object.assign( {}, conversionApi );

		// `convertItem`, `convertChildren` and `splitToAllowedParent` are bound to this `UpcastDispatcher`
		// instance and set on `conversionApi`. This way only a part of `UpcastDispatcher` API is exposed.
		this.conversionApi.convertItem = this._convertItem.bind( this );
		this.conversionApi.convertChildren = this._convertChildren.bind( this );
		this.conversionApi.splitToAllowedParent = this._splitToAllowedParent.bind( this );
	}

	/**
	 * Starts the conversion process. The entry point for the conversion.
	 *
	 * @fires element
	 * @fires text
	 * @fires documentFragment
	 * @param {module:engine/view/documentfragment~DocumentFragment|module:engine/view/element~Element} viewItem
	 * Part of the view to be converted.
	 * @param {module:engine/model/writer~Writer} writer Instance of model writer.
	 * @param {module:engine/model/schema~SchemaContextDefinition} [context=['$root']] Elements will be converted according to this context.
	 * @returns {module:engine/model/documentfragment~DocumentFragment} Model data that is a result of the conversion process
	 * wrapped in `DocumentFragment`. Converted marker elements will be set as that document fragment's
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

		// Conversion result is always a document fragment so let's create this fragment.
		const documentFragment = writer.createDocumentFragment();

		// When there is a conversion result.
		if ( modelRange ) {
			// Remove all empty elements that was added to #_removeIfEmpty list.
			this._removeEmptyElements();

			// Move all items that was converted to context tree to document fragment.
			for ( const item of Array.from( this._modelCursor.parent.getChildren() ) ) {
				writer.append( item, documentFragment );
			}

			// Extract temporary markers elements from model and set as static markers collection.
			documentFragment.markers = extractMarkersFromModelFragment( documentFragment, writer );
		}

		// Clear context position.
		this._modelCursor = null;

		// Clear split elements.
		this._removeIfEmpty.clear();

		// Clear conversion API.
		this.conversionApi.writer = null;
		this.conversionApi.store = null;

		// Return fragment as conversion result.
		return documentFragment;
	}

	/**
	 * @private
	 * @see module:engine/conversion/upcastdispatcher~ViewConversionApi#convertItem
	 */
	_convertItem( viewItem, modelCursor ) {
		const data = Object.assign( { viewItem, modelCursor, modelRange: null } );

		if ( viewItem.is( 'element' ) ) {
			this.fire( 'element:' + viewItem.name, data, this.conversionApi );
		} else if ( viewItem.is( 'text' ) ) {
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
			throw new CKEditorError( 'view-conversion-dispatcher-incorrect-result: Incorrect conversion result was dropped.' );
		}

		return { modelRange: data.modelRange, modelCursor: data.modelCursor };
	}

	/**
	 * @private
	 * @see module:engine/conversion/upcastdispatcher~ViewConversionApi#convertChildren
	 */
	_convertChildren( viewItem, modelCursor ) {
		const modelRange = new ModelRange( modelCursor );
		let nextModelCursor = modelCursor;

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
	 * @see module:engine/conversion/upcastdispatcher~ViewConversionApi#splitToAllowedParent
	 */
	_splitToAllowedParent( node, modelCursor ) {
		// Try to find allowed parent.
		const allowedParent = this.conversionApi.schema.findAllowedParent( node, modelCursor );

		// When there is no parent that allows to insert node then return `null`.
		if ( !allowedParent ) {
			return null;
		}

		// When current position parent allows to insert node then return this position.
		if ( allowedParent === modelCursor.parent ) {
			return { position: modelCursor };
		}

		// When allowed parent is in context tree.
		if ( this._modelCursor.parent.getAncestors().includes( allowedParent ) ) {
			return null;
		}

		// Split element to allowed parent.
		const splitResult = this.conversionApi.writer.split( modelCursor, allowedParent );

		// Remember all elements that are created as a result of split.
		// This is important because at the end of conversion we want to remove all empty split elements.
		//
		// Loop through positions between elements in range (except split result position) and collect parents.
		// <notSplit><split1><split2>[pos]</split2>[pos]</split1>[omit]<split1>[pos]<split2>[pos]</split2></split1></notSplit>
		for ( const position of splitResult.range.getPositions() ) {
			if ( !position.isEqual( splitResult.position ) ) {
				this._removeIfEmpty.add( position.parent );
			}
		}

		return {
			position: splitResult.position,
			cursorParent: splitResult.range.end.parent
		};
	}

	/**
	 * Checks if {@link #_removeIfEmpty} contains empty elements and remove them.
	 * We need to do it smart because there could be elements that are not empty because contains
	 * other empty elements and after removing its children they become available to remove.
	 * We need to continue iterating over split elements as long as any element will be removed.
	 *
	 * @private
	 */
	_removeEmptyElements() {
		let removed = false;

		for ( const element of this._removeIfEmpty ) {
			if ( element.isEmpty ) {
				this.conversionApi.writer.remove( element );
				this._removeIfEmpty.delete( element );
				removed = true;
			}
		}

		if ( removed ) {
			this._removeEmptyElements();
		}
	}

	/**
	 * Fired before the first conversion event, at the beginning of upcast (view to model conversion) process.
	 *
	 * @event viewCleanup
	 * @param {module:engine/view/documentfragment~DocumentFragment|module:engine/view/element~Element}
	 * viewItem Part of the view to be converted.
	 */

	/**
	 * Fired when {@link module:engine/view/element~Element} is converted.
	 *
	 * `element` is a namespace event for a class of events. Names of actually called events follow this pattern:
	 * `element:<elementName>` where `elementName` is the name of converted element. This way listeners may listen to
	 * all elements conversion or to conversion of specific elements.
	 *
	 * @event element
	 * @param {Object} data Conversion data. Keep in mind that this object is shared by reference between all
	 * callbacks that will be called. This means that callbacks can override values if needed, and those values will
	 * be available in other callbacks.
	 * @param {module:engine/view/item~Item} data.viewItem Converted item.
	 * @param {module:engine/model/position~Position} data.modelCursor Position where a converter should start changes.
	 * Change this value for the next converter to tell where the conversion should continue.
	 * @param {module:engine/model/range~Range} data.modelRange The current state of conversion result. Every change to
	 * converted element should be reflected by setting or modifying this property.
	 * @param {ViewConversionApi} conversionApi Conversion utilities to be used by callback.
	 */

	/**
	 * Fired when {@link module:engine/view/text~Text} is converted.
	 *
	 * @event text
	 * @see #event:element
	 */

	/**
	 * Fired when {@link module:engine/view/documentfragment~DocumentFragment} is converted.
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
	const range = ModelRange.createIn( modelItem ).getItems();

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
		const currentPosition = ModelPosition.createBefore( markerElement );

		// When marker of given name is not stored it means that we have found the beginning of the range.
		if ( !markers.has( markerName ) ) {
			markers.set( markerName, new ModelRange( ModelPosition.createFromPosition( currentPosition ) ) );
		// Otherwise is means that we have found end of the marker range.
		} else {
			markers.get( markerName ).end = ModelPosition.createFromPosition( currentPosition );
		}

		// Remove marker element from DocumentFragment.
		writer.remove( markerElement );
	}

	return markers;
}

// Creates model fragment according to given context and returns position in top element.
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

		position = ModelPosition.createAt( current );
	}

	return position;
}

/**
 * Conversion interface that is registered for given {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher}
 * and is passed as one of parameters when {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher dispatcher}
 * fires it's events.
 *
 * @interface ViewConversionApi
 */

/**
 * Starts conversion of given item by firing an appropriate event.
 *
 * Every fired event is passed (as first parameter) an object with `modelRange` property. Every event may set and/or
 * modify that property. When all callbacks are done, the final value of `modelRange` property is returned by this method.
 * The `modelRange` must be {@link module:engine/model/range~Range model range} or `null` (as set by default).
 *
 * @method #convertItem
 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:text
 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:documentFragment
 * @param {module:engine/view/item~Item} viewItem Item to convert.
 * @param {module:engine/model/position~Position} modelCursor Position of conversion.
 * @returns {Object} result Conversion result.
 * @returns {module:engine/model/range~Range|null} result.modelRange Model range containing result of item conversion,
 * created and modified by callbacks attached to fired event, or `null` if the conversion result was incorrect.
 * @returns {module:engine/model/position~Position} result.modelCursor Position where conversion should be continued.
 */

/**
 * Starts conversion of all children of given item by firing appropriate events for all those children.
 *
 * @method #convertChildren
 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element
 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:text
 * @fires module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:documentFragment
 * @param {module:engine/view/item~Item} viewItem Item to convert.
 * @param {module:engine/model/position~Position} modelCursor Position of conversion.
 * @returns {Object} result Conversion result.
 * @returns {module:engine/model/range~Range} result.modelRange Model range containing results of conversion of all children of given item.
 * When no children was converted then range is collapsed.
 * @returns {module:engine/model/position~Position} result.modelCursor Position where conversion should be continued.
 */

/**
 * Checks {@link module:engine/model/schema~Schema schema} to find allowed parent for element that we are going to insert
 * starting from given position. If current parent does not allow to insert element but one of the ancestors does then
 * split nodes to allowed parent.
 *
 * If schema allows to insert node in given position, nothing is split and object with that position is returned.
 *
 * If it was not possible to find allowed parent, `null` is returned, nothing is split.
 *
 * Otherwise, ancestors are split and object with position and the copy of the split element is returned.
 *
 * For instance, if `<image>` is not allowed in `<paragraph>` but is allowed in `$root`:
 *
 *		<paragraph>foo[]bar</paragraph>
 *
 *  	-> split for `<image>` ->
 *
 *  	<paragraph>foo</paragraph>[]<paragraph>bar</paragraph>
 *
 * In the sample above position between `<paragraph>` elements will be returned as `position` and the second `paragraph`
 * as `cursorParent`.
 *
 * @method #splitToAllowedParent
 * @param {module:engine/model/position~Position} position Position on which element is going to be inserted.
 * @param {module:engine/model/node~Node} node Node to insert.
 * @returns {Object|null} Split result. If it was not possible to find allowed position `null` is returned.
 * @returns {module:engine/model/position~Position} position between split elements.
 * @returns {module:engine/model/element~Element} [cursorParent] Element inside which cursor should be placed to
 * continue conversion. When element is not defined it means that there was no split.
 */

/**
 * Instance of {@link module:engine/conversion/viewconsumable~ViewConsumable}. It stores
 * information about what parts of processed view item are still waiting to be handled. After a piece of view item
 * was converted, appropriate consumable value should be {@link module:engine/conversion/viewconsumable~ViewConsumable#consume consumed}.
 *
 * @param {Object} #consumable
 */

/**
 * Custom data stored by converters for conversion process. Custom properties of this object can be defined and use to
 * pass parameters between converters.
 *
 * The difference between this property and `data` parameter of
 * {@link module:engine/conversion/upcastdispatcher~UpcastDispatcher#event:element} is that `data` parameters allows you
 * to pass parameters within a single event and `store` within the whole conversion.
 *
 * @param {Object} #store
 */
