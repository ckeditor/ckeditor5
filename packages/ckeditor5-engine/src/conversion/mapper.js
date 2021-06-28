/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/conversion/mapper
 */

import ModelPosition from '../model/position';
import ModelRange from '../model/range';

import ViewPosition from '../view/position';
import ViewRange from '../view/range';
import ViewText from '../view/text';

import EmitterMixin from '@ckeditor/ckeditor5-utils/src/emittermixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * Maps elements, positions and markers between {@link module:engine/view/document~Document the view} and
 * {@link module:engine/model/model the model}.
 *
 * The instance of the Mapper used for the editing pipeline is available in
 * {@link module:engine/controller/editingcontroller~EditingController#mapper `editor.editing.mapper`}.
 *
 * Mapper uses bound elements to find corresponding elements and positions, so, to get proper results,
 * all model elements should be {@link module:engine/conversion/mapper~Mapper#bindElements bound}.
 *
 * To map complex model to/from view relations, you may provide custom callbacks for
 * {@link module:engine/conversion/mapper~Mapper#event:modelToViewPosition modelToViewPosition event} and
 * {@link module:engine/conversion/mapper~Mapper#event:viewToModelPosition viewToModelPosition event} that are fired whenever
 * a position mapping request occurs.
 * Those events are fired by {@link module:engine/conversion/mapper~Mapper#toViewPosition toViewPosition}
 * and {@link module:engine/conversion/mapper~Mapper#toModelPosition toModelPosition} methods. `Mapper` adds it's own default callbacks
 * with `'lowest'` priority. To override default `Mapper` mapping, add custom callback with higher priority and
 * stop the event.
 * @mixes module:utils/emittermixin~EmitterMixin
 */
export default class Mapper {
	/**
	 * Creates an instance of the mapper.
	 */
	constructor() {
		/**
		 * Model element to view element mapping.
		 *
		 * @private
		 * @member {WeakMap}
		 */
		this._modelToViewMapping = new WeakMap();

		/**
		 * View element to model element mapping.
		 *
		 * @private
		 * @member {WeakMap}
		 */
		this._viewToModelMapping = new WeakMap();

		/**
		 * A map containing callbacks between view element names and functions evaluating length of view elements
		 * in model.
		 *
		 * @private
		 * @member {Map}
		 */
		this._viewToModelLengthCallbacks = new Map();

		/**
		 * Model marker name to view elements mapping.
		 *
		 * Keys are `String`s while values are `Set`s with {@link module:engine/view/element~Element view elements}.
		 * One marker (name) can be mapped to multiple elements.
		 *
		 * @private
		 * @member {Map}
		 */
		this._markerNameToElements = new Map();

		/**
		 * View element to model marker names mapping.
		 *
		 * This is reverse to {@link ~Mapper#_markerNameToElements} map.
		 *
		 * @private
		 * @member {Map}
		 */
		this._elementToMarkerNames = new Map();

		/**
		 * Stores marker names of markers which has changed due to unbinding a view element (so it is assumed that the view element
		 * has been removed, moved or renamed).
		 *
		 * @private
		 * @member {Set.<module:engine/model/markercollection~Marker>}
		 */
		this._unboundMarkerNames = new Set();

		// Default mapper algorithm for mapping model position to view position.
		this.on( 'modelToViewPosition', ( evt, data ) => {
			if ( data.viewPosition ) {
				return;
			}

			const viewContainer = this._modelToViewMapping.get( data.modelPosition.parent );

			data.viewPosition = this.findPositionIn( viewContainer, data.modelPosition.offset );
		}, { priority: 'low' } );

		// Default mapper algorithm for mapping view position to model position.
		this.on( 'viewToModelPosition', ( evt, data ) => {
			if ( data.modelPosition ) {
				return;
			}

			const viewBlock = this.findMappedViewAncestor( data.viewPosition );
			const modelParent = this._viewToModelMapping.get( viewBlock );
			const modelOffset = this._toModelOffset( data.viewPosition.parent, data.viewPosition.offset, viewBlock );

			data.modelPosition = ModelPosition._createAt( modelParent, modelOffset );
		}, { priority: 'low' } );
	}

	/**
	 * Marks model and view elements as corresponding. Corresponding elements can be retrieved by using
	 * the {@link module:engine/conversion/mapper~Mapper#toModelElement toModelElement} and
	 * {@link module:engine/conversion/mapper~Mapper#toViewElement toViewElement} methods.
	 * The information that elements are bound is also used to translate positions.
	 *
	 * @param {module:engine/model/element~Element} modelElement Model element.
	 * @param {module:engine/view/element~Element} viewElement View element.
	 */
	bindElements( modelElement, viewElement ) {
		this._modelToViewMapping.set( modelElement, viewElement );
		this._viewToModelMapping.set( viewElement, modelElement );
	}

	/**
	 * Unbinds given {@link module:engine/view/element~Element view element} from the map.
	 *
	 * **Note:** view-to-model binding will be removed, if it existed. However, corresponding model-to-view binding
	 * will be removed only if model element is still bound to passed `viewElement`.
	 *
	 * This behavior lets for re-binding model element to another view element without fear of losing the new binding
	 * when the previously bound view element is unbound.
	 *
	 * @param {module:engine/view/element~Element} viewElement View element to unbind.
	 */
	unbindViewElement( viewElement ) {
		const modelElement = this.toModelElement( viewElement );

		this._viewToModelMapping.delete( viewElement );

		if ( this._elementToMarkerNames.has( viewElement ) ) {
			for ( const markerName of this._elementToMarkerNames.get( viewElement ) ) {
				this._unboundMarkerNames.add( markerName );
			}
		}

		if ( this._modelToViewMapping.get( modelElement ) == viewElement ) {
			this._modelToViewMapping.delete( modelElement );
		}
	}

	/**
	 * Unbinds given {@link module:engine/model/element~Element model element} from the map.
	 *
	 * **Note:** model-to-view binding will be removed, if it existed. However, corresponding view-to-model binding
	 * will be removed only if view element is still bound to passed `modelElement`.
	 *
	 * This behavior lets for re-binding view element to another model element without fear of losing the new binding
	 * when the previously bound model element is unbound.
	 *
	 * @param {module:engine/model/element~Element} modelElement Model element to unbind.
	 */
	unbindModelElement( modelElement ) {
		const viewElement = this.toViewElement( modelElement );

		this._modelToViewMapping.delete( modelElement );

		if ( this._viewToModelMapping.get( viewElement ) == modelElement ) {
			this._viewToModelMapping.delete( viewElement );
		}
	}

	/**
	 * Binds given marker name with given {@link module:engine/view/element~Element view element}. The element
	 * will be added to the current set of elements bound with given marker name.
	 *
	 * @param {module:engine/view/element~Element} element Element to bind.
	 * @param {String} name Marker name.
	 */
	bindElementToMarker( element, name ) {
		const elements = this._markerNameToElements.get( name ) || new Set();
		elements.add( element );

		const names = this._elementToMarkerNames.get( element ) || new Set();
		names.add( name );

		this._markerNameToElements.set( name, elements );
		this._elementToMarkerNames.set( element, names );
	}

	/**
	 * Unbinds an element from given marker name.
	 *
	 * @param {module:engine/view/element~Element} element Element to unbind.
	 * @param {String} name Marker name.
	 */
	unbindElementFromMarkerName( element, name ) {
		const nameToElements = this._markerNameToElements.get( name );

		if ( nameToElements ) {
			nameToElements.delete( element );

			if ( nameToElements.size == 0 ) {
				this._markerNameToElements.delete( name );
			}
		}

		const elementToNames = this._elementToMarkerNames.get( element );

		if ( elementToNames ) {
			elementToNames.delete( name );

			if ( elementToNames.size == 0 ) {
				this._elementToMarkerNames.delete( element );
			}
		}
	}

	/**
	 * Returns all marker names of markers which has changed due to unbinding a view element (so it is assumed that the view element
	 * has been removed, moved or renamed) since the last flush. After returning, the marker names list is cleared.
	 *
	 * @returns {Array.<String>}
	 */
	flushUnboundMarkerNames() {
		const markerNames = Array.from( this._unboundMarkerNames );

		this._unboundMarkerNames.clear();

		return markerNames;
	}

	/**
	 * Removes all model to view and view to model bindings.
	 */
	clearBindings() {
		this._modelToViewMapping = new WeakMap();
		this._viewToModelMapping = new WeakMap();
		this._markerNameToElements = new Map();
		this._elementToMarkerNames = new Map();
		this._unboundMarkerNames = new Set();
	}

	/**
	 * Gets the corresponding model element.
	 *
	 * **Note:** {@link module:engine/view/uielement~UIElement} does not have corresponding element in model.
	 *
	 * @param {module:engine/view/element~Element} viewElement View element.
	 * @returns {module:engine/model/element~Element|undefined} Corresponding model element or `undefined` if not found.
	 */
	toModelElement( viewElement ) {
		return this._viewToModelMapping.get( viewElement );
	}

	/**
	 * Gets the corresponding view element.
	 *
	 * @param {module:engine/model/element~Element} modelElement Model element.
	 * @returns {module:engine/view/element~Element|undefined} Corresponding view element or `undefined` if not found.
	 */
	toViewElement( modelElement ) {
		return this._modelToViewMapping.get( modelElement );
	}

	/**
	 * Gets the corresponding model range.
	 *
	 * @param {module:engine/view/range~Range} viewRange View range.
	 * @returns {module:engine/model/range~Range} Corresponding model range.
	 */
	toModelRange( viewRange ) {
		return new ModelRange( this.toModelPosition( viewRange.start ), this.toModelPosition( viewRange.end ) );
	}

	/**
	 * Gets the corresponding view range.
	 *
	 * @param {module:engine/model/range~Range} modelRange Model range.
	 * @returns {module:engine/view/range~Range} Corresponding view range.
	 */
	toViewRange( modelRange ) {
		return new ViewRange( this.toViewPosition( modelRange.start ), this.toViewPosition( modelRange.end ) );
	}

	/**
	 * Gets the corresponding model position.
	 *
	 * @fires viewToModelPosition
	 * @param {module:engine/view/position~Position} viewPosition View position.
	 * @returns {module:engine/model/position~Position} Corresponding model position.
	 */
	toModelPosition( viewPosition ) {
		const data = {
			viewPosition,
			mapper: this
		};

		this.fire( 'viewToModelPosition', data );

		return data.modelPosition;
	}

	/**
	 * Gets the corresponding view position.
	 *
	 * @fires modelToViewPosition
	 * @param {module:engine/model/position~Position} modelPosition Model position.
	 * @param {Object} [options] Additional options for position mapping process.
	 * @param {Boolean} [options.isPhantom=false] Should be set to `true` if the model position to map is pointing to a place
	 * in model tree which no longer exists. For example, it could be an end of a removed model range.
	 * @returns {module:engine/view/position~Position} Corresponding view position.
	 */
	toViewPosition( modelPosition, options = { isPhantom: false } ) {
		const data = {
			modelPosition,
			mapper: this,
			isPhantom: options.isPhantom
		};

		this.fire( 'modelToViewPosition', data );

		return data.viewPosition;
	}

	/**
	 * Gets all view elements bound to the given marker name.
	 *
	 * @param {String} name Marker name.
	 * @returns {Set.<module:engine/view/element~Element>|null} View elements bound with given marker name or `null`
	 * if no elements are bound to given marker name.
	 */
	markerNameToElements( name ) {
		const boundElements = this._markerNameToElements.get( name );

		if ( !boundElements ) {
			return null;
		}

		const elements = new Set();

		for ( const element of boundElements ) {
			if ( element.is( 'attributeElement' ) ) {
				for ( const clone of element.getElementsWithSameId() ) {
					elements.add( clone );
				}
			} else {
				elements.add( element );
			}
		}

		return elements;
	}

	/**
	 * Registers a callback that evaluates the length in the model of a view element with given name.
	 *
	 * The callback is fired with one argument, which is a view element instance. The callback is expected to return
	 * a number representing the length of view element in model.
	 *
	 *		// List item in view may contain nested list, which have other list items. In model though,
	 *		// the lists are represented by flat structure. Because of those differences, length of list view element
	 *		// may be greater than one. In the callback it's checked how many nested list items are in evaluated list item.
	 *
	 *		function getViewListItemLength( element ) {
	 *			let length = 1;
	 *
	 *			for ( let child of element.getChildren() ) {
	 *				if ( child.name == 'ul' || child.name == 'ol' ) {
	 *					for ( let item of child.getChildren() ) {
	 *						length += getViewListItemLength( item );
	 *					}
	 *				}
	 *			}
	 *
	 *			return length;
	 *		}
	 *
	 *		mapper.registerViewToModelLength( 'li', getViewListItemLength );
	 *
	 * @param {String} viewElementName Name of view element for which callback is registered.
	 * @param {Function} lengthCallback Function return a length of view element instance in model.
	 */
	registerViewToModelLength( viewElementName, lengthCallback ) {
		this._viewToModelLengthCallbacks.set( viewElementName, lengthCallback );
	}

	/**
	 * For given `viewPosition`, finds and returns the closest ancestor of this position that has a mapping to
	 * the model.
	 *
	 * @param {module:engine/view/position~Position} viewPosition Position for which mapped ancestor should be found.
	 * @returns {module:engine/view/element~Element}
	 */
	findMappedViewAncestor( viewPosition ) {
		let parent = viewPosition.parent;

		while ( !this._viewToModelMapping.has( parent ) ) {
			parent = parent.parent;
		}

		return parent;
	}

	/**
	 * Calculates model offset based on the view position and the block element.
	 *
	 * Example:
	 *
	 *		<p>foo<b>ba|r</b></p> // _toModelOffset( b, 2, p ) -> 5
	 *
	 * Is a sum of:
	 *
	 *		<p>foo|<b>bar</b></p> // _toModelOffset( p, 3, p ) -> 3
	 *		<p>foo<b>ba|r</b></p> // _toModelOffset( b, 2, b ) -> 2
	 *
	 * @private
	 * @param {module:engine/view/element~Element} viewParent Position parent.
	 * @param {Number} viewOffset Position offset.
	 * @param {module:engine/view/element~Element} viewBlock Block used as a base to calculate offset.
	 * @returns {Number} Offset in the model.
	 */
	_toModelOffset( viewParent, viewOffset, viewBlock ) {
		if ( viewBlock != viewParent ) {
			// See example.
			const offsetToParentStart = this._toModelOffset( viewParent.parent, viewParent.index, viewBlock );
			const offsetInParent = this._toModelOffset( viewParent, viewOffset, viewParent );

			return offsetToParentStart + offsetInParent;
		}

		// viewBlock == viewParent, so we need to calculate the offset in the parent element.

		// If the position is a text it is simple ("ba|r" -> 2).
		if ( viewParent.is( '$text' ) ) {
			return viewOffset;
		}

		// If the position is in an element we need to sum lengths of siblings ( <b> bar </b> foo | -> 3 + 3 = 6 ).
		let modelOffset = 0;

		for ( let i = 0; i < viewOffset; i++ ) {
			modelOffset += this.getModelLength( viewParent.getChild( i ) );
		}

		return modelOffset;
	}

	/**
	 * Gets the length of the view element in the model.
	 *
	 * The length is calculated as follows:
	 * * if {@link #registerViewToModelLength length mapping callback} is provided for given `viewNode` it is used to
	 * evaluate model length (`viewNode` is used as first and only parameter passed to the callback),
	 * * length of a {@link module:engine/view/text~Text text node} is equal to the length of it's
	 * {@link module:engine/view/text~Text#data data},
	 * * length of a {@link module:engine/view/uielement~UIElement ui element} is equal to 0,
	 * * length of a mapped {@link module:engine/view/element~Element element} is equal to 1,
	 * * length of a not-mapped {@link module:engine/view/element~Element element} is equal to the length of it's children.
	 *
	 * Examples:
	 *
	 *		foo                          -> 3 // Text length is equal to it's data length.
	 *		<p>foo</p>                   -> 1 // Length of an element which is mapped is by default equal to 1.
	 *		<b>foo</b>                   -> 3 // Length of an element which is not mapped is a length of its children.
	 *		<div><p>x</p><p>y</p></div>  -> 2 // Assuming that <div> is not mapped and <p> are mapped.
	 *
	 * @param {module:engine/view/element~Element} viewNode View node.
	 * @returns {Number} Length of the node in the tree model.
	 */
	getModelLength( viewNode ) {
		if ( this._viewToModelLengthCallbacks.get( viewNode.name ) ) {
			const callback = this._viewToModelLengthCallbacks.get( viewNode.name );

			return callback( viewNode );
		} else if ( this._viewToModelMapping.has( viewNode ) ) {
			return 1;
		} else if ( viewNode.is( '$text' ) ) {
			return viewNode.data.length;
		} else if ( viewNode.is( 'uiElement' ) ) {
			return 0;
		} else {
			let len = 0;

			for ( const child of viewNode.getChildren() ) {
				len += this.getModelLength( child );
			}

			return len;
		}
	}

	/**
	 * Finds the position in the view node (or its children) with the expected model offset.
	 *
	 * Example:
	 *
	 *		<p>fo<b>bar</b>bom</p> -> expected offset: 4
	 *
	 *		findPositionIn( p, 4 ):
	 *		<p>|fo<b>bar</b>bom</p> -> expected offset: 4, actual offset: 0
	 *		<p>fo|<b>bar</b>bom</p> -> expected offset: 4, actual offset: 2
	 *		<p>fo<b>bar</b>|bom</p> -> expected offset: 4, actual offset: 5 -> we are too far
	 *
	 *		findPositionIn( b, 4 - ( 5 - 3 ) ):
	 *		<p>fo<b>|bar</b>bom</p> -> expected offset: 2, actual offset: 0
	 *		<p>fo<b>bar|</b>bom</p> -> expected offset: 2, actual offset: 3 -> we are too far
	 *
	 *		findPositionIn( bar, 2 - ( 3 - 3 ) ):
	 *		We are in the text node so we can simple find the offset.
	 *		<p>fo<b>ba|r</b>bom</p> -> expected offset: 2, actual offset: 2 -> position found
	 *
	 * @param {module:engine/view/element~Element} viewParent Tree view element in which we are looking for the position.
	 * @param {Number} expectedOffset Expected offset.
	 * @returns {module:engine/view/position~Position} Found position.
	 */
	findPositionIn( viewParent, expectedOffset ) {
		// Last scanned view node.
		let viewNode;
		// Length of the last scanned view node.
		let lastLength = 0;

		let modelOffset = 0;
		let viewOffset = 0;

		// In the text node it is simple: offset in the model equals offset in the text.
		if ( viewParent.is( '$text' ) ) {
			return new ViewPosition( viewParent, expectedOffset );
		}

		// In other cases we add lengths of child nodes to find the proper offset.

		// If it is smaller we add the length.
		while ( modelOffset < expectedOffset ) {
			viewNode = viewParent.getChild( viewOffset );
			lastLength = this.getModelLength( viewNode );
			modelOffset += lastLength;
			viewOffset++;
		}

		// If it equals we found the position.
		if ( modelOffset == expectedOffset ) {
			return this._moveViewPositionToTextNode( new ViewPosition( viewParent, viewOffset ) );
		}
		// If it is higher we need to enter last child.
		else {
			// ( modelOffset - lastLength ) is the offset to the child we enter,
			// so we subtract it from the expected offset to fine the offset in the child.
			return this.findPositionIn( viewNode, expectedOffset - ( modelOffset - lastLength ) );
		}
	}

	/**
	 * Because we prefer positions in text nodes over positions next to text node moves view position to the text node
	 * if it was next to it.
	 *
	 *		<p>[]<b>foo</b></p> -> <p>[]<b>foo</b></p> // do not touch if position is not directly next to text
	 *		<p>foo[]<b>foo</b></p> -> <p>foo{}<b>foo</b></p> // move to text node
	 *		<p><b>[]foo</b></p> -> <p><b>{}foo</b></p> // move to text node
	 *
	 * @private
	 * @param {module:engine/view/position~Position} viewPosition Position potentially next to text node.
	 * @returns {module:engine/view/position~Position} Position in text node if possible.
	 */
	_moveViewPositionToTextNode( viewPosition ) {
		// If the position is just after text node, put it at the end of that text node.
		// If the position is just before text node, put it at the beginning of that text node.
		const nodeBefore = viewPosition.nodeBefore;
		const nodeAfter = viewPosition.nodeAfter;

		if ( nodeBefore instanceof ViewText ) {
			return new ViewPosition( nodeBefore, nodeBefore.data.length );
		} else if ( nodeAfter instanceof ViewText ) {
			return new ViewPosition( nodeAfter, 0 );
		}

		// Otherwise, just return the given position.
		return viewPosition;
	}

	/**
	 * Fired for each model-to-view position mapping request. The purpose of this event is to enable custom model-to-view position
	 * mapping. Callbacks added to this event take {@link module:engine/model/position~Position model position} and are expected to
	 * calculate {@link module:engine/view/position~Position view position}. Calculated view position should be added as `viewPosition`
	 * value in `data` object that is passed as one of parameters to the event callback.
	 *
	 * 		// Assume that "captionedImage" model element is converted to <img> and following <span> elements in view,
	 * 		// and the model element is bound to <img> element. Force mapping model positions inside "captionedImage" to that
	 * 		// <span> element.
	 *		mapper.on( 'modelToViewPosition', ( evt, data ) => {
	 *			const positionParent = modelPosition.parent;
	 *
	 *			if ( positionParent.name == 'captionedImage' ) {
	 *				const viewImg = data.mapper.toViewElement( positionParent );
	 *				const viewCaption = viewImg.nextSibling; // The <span> element.
	 *
	 *				data.viewPosition = new ViewPosition( viewCaption, modelPosition.offset );
	 *
	 *				// Stop the event if other callbacks should not modify calculated value.
	 *				evt.stop();
	 *			}
	 *		} );
	 *
	 * **Note:** keep in mind that sometimes a "phantom" model position is being converted. "Phantom" model position is
	 * a position that points to a non-existing place in model. Such position might still be valid for conversion, though
	 * (it would point to a correct place in view when converted). One example of such situation is when a range is
	 * removed from model, there may be a need to map the range's end (which is no longer valid model position). To
	 * handle such situation, check `data.isPhantom` flag:
	 *
	 * 		// Assume that there is "customElement" model element and whenever position is before it, we want to move it
	 * 		// to the inside of the view element bound to "customElement".
	 *		mapper.on( 'modelToViewPosition', ( evt, data ) => {
	 *			if ( data.isPhantom ) {
	 *				return;
	 *			}
	 *
	 *			// Below line might crash for phantom position that does not exist in model.
	 *			const sibling = data.modelPosition.nodeBefore;
	 *
	 *			// Check if this is the element we are interested in.
	 *			if ( !sibling.is( 'element', 'customElement' ) ) {
	 *				return;
	 *			}
	 *
	 *			const viewElement = data.mapper.toViewElement( sibling );
	 *
	 *			data.viewPosition = new ViewPosition( sibling, 0 );
	 *
	 *			evt.stop();
	 *		} );
	 *
	 * **Note:** default mapping callback is provided with `low` priority setting and does not cancel the event, so it is possible to
	 * attach a custom callback after default callback and also use `data.viewPosition` calculated by default callback
	 * (for example to fix it).
	 *
	 * **Note:** default mapping callback will not fire if `data.viewPosition` is already set.
	 *
	 * **Note:** these callbacks are called **very often**. For efficiency reasons, it is advised to use them only when position
	 * mapping between given model and view elements is unsolvable using just elements mapping and default algorithm. Also,
	 * the condition that checks if special case scenario happened should be as simple as possible.
	 *
	 * @event modelToViewPosition
	 * @param {Object} data Data pipeline object that can store and pass data between callbacks. The callback should add
	 * `viewPosition` value to that object with calculated {@link module:engine/view/position~Position view position}.
	 * @param {module:engine/conversion/mapper~Mapper} data.mapper Mapper instance that fired the event.
	 */

	/**
	 * Fired for each view-to-model position mapping request. See {@link module:engine/conversion/mapper~Mapper#event:modelToViewPosition}.
	 *
	 * 		// See example in `modelToViewPosition` event description.
	 * 		// This custom mapping will map positions from <span> element next to <img> to the "captionedImage" element.
	 *		mapper.on( 'viewToModelPosition', ( evt, data ) => {
	 *			const positionParent = viewPosition.parent;
	 *
	 *			if ( positionParent.hasClass( 'image-caption' ) ) {
	 *				const viewImg = positionParent.previousSibling;
	 *				const modelImg = data.mapper.toModelElement( viewImg );
	 *
	 *				data.modelPosition = new ModelPosition( modelImg, viewPosition.offset );
	 *				evt.stop();
	 *			}
	 *		} );
	 *
	 * **Note:** default mapping callback is provided with `low` priority setting and does not cancel the event, so it is possible to
	 * attach a custom callback after default callback and also use `data.modelPosition` calculated by default callback
	 * (for example to fix it).
	 *
	 * **Note:** default mapping callback will not fire if `data.modelPosition` is already set.
	 *
	 * **Note:** these callbacks are called **very often**. For efficiency reasons, it is advised to use them only when position
	 * mapping between given model and view elements is unsolvable using just elements mapping and default algorithm. Also,
	 * the condition that checks if special case scenario happened should be as simple as possible.
	 *
	 * @event viewToModelPosition
	 * @param {Object} data Data pipeline object that can store and pass data between callbacks. The callback should add
	 * `modelPosition` value to that object with calculated {@link module:engine/model/position~Position model position}.
	 * @param {module:engine/conversion/mapper~Mapper} data.mapper Mapper instance that fired the event.
	 */
}

mix( Mapper, EmitterMixin );
