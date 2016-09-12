/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelPosition from '../model/position.js';
import ModelRange from '../model/range.js';

import ViewPosition from '../view/position.js';
import ViewRange from '../view/range.js';
import ViewText from '../view/text.js';

import EmitterMixin from '../../utils/emittermixin.js';
import mix from '../../utils/mix.js';

/**
 * Maps elements and positions between {@link engine.view.Document view} and {@link engine.model model}.
 *
 * Mapper use bound elements to find corresponding elements and positions, so, to get proper results,
 * all model elements should be {@link engine.conversion.Mapper#bindElements bound}.
 *
 * To map complex model to/from view relations, you may provide custom callbacks for
 * {@link engine.conversion.Mapper#event:modelToViewPosition modelToViewPosition event} and
 * {@link engine.conversion.Mapper#event:viewToModelPosition viewToModelPosition event} that are fired whenever
 * a position mapping request occurs. Those events are fired by {@link engine.conversion.Mapper#toViewPosition toViewPosition}
 * and {@link engine.conversion.Mapper#toModelPosition toModelPosition} methods. `Mapper` adds it's own default callbacks
 * with `'lowest'` priority. To override default `Mapper` mapping, add custom callback with higher priority and
 * stop the event.
 *
 * @memberOf engine.conversion
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
		 * @member {WeakMap} engine.conversion.Mapper#_modelToViewMapping
		 */
		this._modelToViewMapping = new WeakMap();

		/**
		 * View element to model element mapping.
		 *
		 * @private
		 * @member {WeakMap} engine.conversion.Mapper#_viewToModelMapping
		 */
		this._viewToModelMapping = new WeakMap();

		/**
		 * A map containing callbacks between view element classes and functions evaluating length of view elements
		 * in model.
		 *
		 * @private
		 * @member {Map} engine.conversion.Mapper#_viewToModelLengthCallbacks
		 */
		this._viewToModelLengthCallbacks = new Map();

		// Add default callback for model to view position mapping.
		this.on( 'modelToViewPosition', ( evt, data ) => {
			let viewContainer = this._modelToViewMapping.get( data.modelPosition.parent );

			data.viewPosition = this._findPositionIn( viewContainer, data.modelPosition.offset );
		}, 'lowest' );

		// Add default callback for view to model position mapping.
		this.on( 'viewToModelPosition', ( evt, data ) => {
			let viewBlock = data.viewPosition.parent;
			let modelParent = this._viewToModelMapping.get( viewBlock );

			while ( !modelParent ) {
				viewBlock = viewBlock.parent;
				modelParent = this._viewToModelMapping.get( viewBlock );
			}

			let modelOffset = this._toModelOffset( data.viewPosition.parent, data.viewPosition.offset, viewBlock );

			data.modelPosition = ModelPosition.createFromParentAndOffset( modelParent, modelOffset );
		}, 'lowest' );
	}

	/**
	 * Marks model and view elements as corresponding. Corresponding elements can be retrieved by using
	 * the {@link engine.conversion.Mapper#toModelElement toModelElement} and
	 * {@link engine.conversion.Mapper#toViewElement toViewElement} methods.
	 * The information that elements are bound is also used to translate positions.
	 *
	 * @param {engine.model.Element} modelElement Model element.
	 * @param {engine.view.Element} viewElement View element.
	 */
	bindElements( modelElement, viewElement ) {
		this._modelToViewMapping.set( modelElement, viewElement );
		this._viewToModelMapping.set( viewElement, modelElement );
	}

	/**
	 * Unbinds given {@link engine.view.Element view element} from the map.
	 *
	 * @param {engine.view.Element} viewElement View element to unbind.
	 */
	unbindViewElement( viewElement ) {
		const modelElement = this.toModelElement( viewElement );

		this._unbindElements( modelElement, viewElement );
	}

	/**
	 * Unbinds given {@link engine.model.Element model element} from the map.
	 *
	 * @param {engine.model.Element} modelElement Model element to unbind.
	 */
	unbindModelElement( modelElement ) {
		const viewElement = this.toViewElement( modelElement );

		this._unbindElements( modelElement, viewElement );
	}

	/**
	 * Removes binding between given elements.
	 *
	 * @private
	 * @param {engine.model.Element} modelElement Model element to unbind.
	 * @param {engine.view.Element} viewElement View element to unbind.
	 */
	_unbindElements( modelElement, viewElement ) {
		this._viewToModelMapping.delete( viewElement );
		this._modelToViewMapping.delete( modelElement );
	}

	/**
	 * Removes all model to view and view to model bindings.
	 */
	clearBindings() {
		this._modelToViewMapping = new WeakMap();
		this._viewToModelMapping = new WeakMap();
	}

	/**
	 * Gets the corresponding model element.
	 *
	 * @param {engine.view.Element} viewElement View element.
	 * @returns {engine.model.Element|undefined} Corresponding model element or `undefined` if not found.
	 */
	toModelElement( viewElement ) {
		return this._viewToModelMapping.get( viewElement );
	}

	/**
	 * Gets the corresponding view element.
	 *
	 * @param {engine.model.Element} modelElement Model element.
	 * @returns {engine.view.Element|undefined} Corresponding view element or `undefined` if not found.
	 */
	toViewElement( modelElement ) {
		return this._modelToViewMapping.get( modelElement );
	}

	/**
	 * Gets the corresponding model range.
	 *
	 * @param {engine.view.Range} viewRange View range.
	 * @returns {engine.model.Range} Corresponding model range.
	 */
	toModelRange( viewRange ) {
		return new ModelRange( this.toModelPosition( viewRange.start ), this.toModelPosition( viewRange.end ) );
	}

	/**
	 * Gets the corresponding view range.
	 *
	 * @param {engine.model.Range} modelRange Model range.
	 * @returns {engine.view.Range} Corresponding view range.
	 */
	toViewRange( modelRange ) {
		return new ViewRange( this.toViewPosition( modelRange.start ), this.toViewPosition( modelRange.end ) );
	}

	/**
	 * Gets the corresponding model position.
	 *
	 * @fires engine.conversion.Mapper#event:viewToModelPosition
	 * @param {engine.view.Position} viewPosition View position.
	 * @returns {engine.model.Position} Corresponding model position.
	 */
	toModelPosition( viewPosition ) {
		const data = {
			viewPosition: viewPosition,
			modelPosition: null
		};

		this.fire( 'viewToModelPosition', data );

		return data.modelPosition;
	}

	/**
	 * Gets the corresponding view position.
	 *
	 * @fires engine.conversion.Mapper#event:modelToViewPosition
	 * @param {engine.model.Position} modelPosition Model position.
	 * @returns {engine.view.Position} Corresponding view position.
	 */
	toViewPosition( modelPosition ) {
		const data = {
			viewPosition: null,
			modelPosition: modelPosition
		};

		this.fire( 'modelToViewPosition', data );

		return data.viewPosition;
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
	 * @param {engine.view.Element} viewParent Position parent.
	 * @param {Number} viewOffset Position offset.
	 * @param {engine.view.Element} viewBlock Block used as a base to calculate offset.
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
		if ( viewParent instanceof ViewText ) {
			return viewOffset;
		}

		// If the position is in an element we need to sum lengths of siblings ( <b> bar </b> foo | -> 3 + 3 = 6 ).
		let modelOffset = 0;

		for ( let i = 0; i < viewOffset; i++ ) {
			modelOffset += this._getModelLength( viewParent.getChild( i ) );
		}

		return modelOffset;
	}

	/**
	 * Gets the length of the view element in the model.
	 *
	 * The length is calculated as follows:
	 * * length of a {@link engine.view.Text text node} is equal to the length of it's {@link engine.view.Text#data data},
	 * * length of a mapped {@link engine.view.Element element} is equal to it's {@link engine.view.Element#modelLength modelLength},
	 * * length of a not-mapped {@link engine.view.Element element} is equal to the length of it's children.
	 *
	 * Examples:
	 *
	 *		foo                     -> 3 // Text length is equal to it's data length.
	 *		<p>foo</p>              -> 1 // Length of an element which is mapped is equal to modelLength, 1 by default.
	 *		<b>foo</b>              -> 3 // Length of an element which is not mapped is a length of its children.
	 *		<div><p>x</p><p>y</p>   -> 2 // Assuming that <div> is not mapped and <p> are mapped.
	 *
	 * @private
	 * @param {engine.view.Element} viewNode View node.
	 * @returns {Number} Length of the node in the tree model.
	 */
	_getModelLength( viewNode ) {
		if ( this._viewToModelMapping.has( viewNode ) ) {
			const callback = this._viewToModelLengthCallbacks.get( viewNode.name );

			return callback ? callback( viewNode ) : 1;
		} else if ( viewNode instanceof ViewText ) {
			return viewNode.data.length;
		} else {
			let len = 0;

			for ( let child of viewNode.getChildren() ) {
				len += this._getModelLength( child );
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
	 *		_findPositionIn( p, 4 ):
	 *		<p>|fo<b>bar</b>bom</p> -> expected offset: 4, actual offset: 0
	 *		<p>fo|<b>bar</b>bom</p> -> expected offset: 4, actual offset: 2
	 *		<p>fo<b>bar</b>|bom</p> -> expected offset: 4, actual offset: 5 -> we are too far
	 *
	 *		_findPositionIn( b, 4 - ( 5 - 3 ) ):
	 *		<p>fo<b>|bar</b>bom</p> -> expected offset: 2, actual offset: 0
	 *		<p>fo<b>bar|</b>bom</p> -> expected offset: 2, actual offset: 3 -> we are too far
	 *
	 *		_findPositionIn( bar, 2 - ( 3 - 3 ) ):
	 *		We are in the text node so we can simple find the offset.
	 *		<p>fo<b>ba|r</b>bom</p> -> expected offset: 2, actual offset: 2 -> position found
	 *
	 * @private
	 * @param {engine.view.Element} viewParent Tree view element in which we are looking for the position.
	 * @param {Number} expectedOffset Expected offset.
	 * @returns {engine.view.Position} Found position.
	 */
	_findPositionIn( viewParent, expectedOffset ) {
		// Last scanned view node.
		let viewNode;
		// Length of the last scanned view node.
		let lastLength = 0;

		let modelOffset = 0;
		let viewOffset = 0;

		// In the text node it is simple: offset in the model equals offset in the text.
		if ( viewParent instanceof ViewText ) {
			return new ViewPosition( viewParent, expectedOffset );
		}

		// In other cases we add lengths of child nodes to find the proper offset.

		// If it is smaller we add the length.
		while ( modelOffset < expectedOffset ) {
			viewNode = viewParent.getChild( viewOffset );
			lastLength = this._getModelLength( viewNode );
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
			return this._findPositionIn( viewNode, expectedOffset - ( modelOffset - lastLength ) );
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
	 * @param {engine.view.Position} viewPosition Position potentially next to text node.
	 * @returns {engine.view.Position} Position in text node if possible.
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
}

mix( Mapper, EmitterMixin );

/**
 * Fired for each model-to-view position mapping request. The purpose of this event is to enable custom model-to-view position
 * mapping. Callbacks added to this event take {@link engine.model.Position model position} and are expected to calculate
 * {@link engine.view.Position view position}. Calculated view position should be added as `viewPosition` value in
 * `data` object that is passed as one of parameters to the event callback.
 *
 * 		// Assume that "captionedImage" model element is converted to <img> and following <span> elements in view,
 * 		// and the model element is bound to <img> element. Force mapping model positions inside "captionedImage" to that <span> element.
 *		mapper.on( 'modelToViewPosition', ( evt, mapper, modelPosition, data ) => {
 *			const positionParent = modelPosition.parent;
 *
 *			if ( positionParent.name == 'captionedImage' ) {
 *				const viewImg = mapper.toViewElement( positionParent );
 *				const viewCaption = viewImg.nextSibling; // The <span> element.
 *
 *				data.viewPosition = new ViewPosition( viewCaption, modelPosition.offset );
 *				evt.stop();
 *			}
 *		} );
 *
 * **Note:** these callbacks are called **very often**. For efficiency reasons, it is advised to use them only when position
 * mapping between given model and view elements is unsolvable using just elements mapping and default algorithm. Also,
 * the condition that checks if special case scenario happened should be as simple as possible.
 *
 * @event engine.conversion.Mapper.modelToViewPosition
 * @param {engine.model.Position} modelPosition Model position to be mapped.
 * @param {Object} data Data pipeline object that can store and pass data between callbacks. The callback should add
 * `viewPosition` value to that object with calculated {@link engine.view.Position view position}.
 */

/**
 * Fired for each view-to-model position mapping request. See {@link engine.conversion.Mapper#event:modelToViewPosition}.
 *
 * 		// See example in `modelToViewPosition` event description.
 * 		// This custom mapping will map positions from <span> element next to <img> to the "captionedImage" element.
 *		mapper.on( 'viewToModelPosition', ( evt, mapper, viewPosition, data ) => {
 *			const positionParent = viewPosition.parent;
 *
 *			if ( positionParent.hasClass( 'image-caption' ) ) {
 *				const viewImg = positionParent.previousSibling;
 *				const modelImg = mapper.toModelElement( viewImg );
 *
 *				data.modelPosition = new ModelPosition( modelImg, viewPosition.offset );
 *				evt.stop();
 *			}
 *		} );
 *
 * @event engine.conversion.Mapper.viewToModelPosition
 * @param {engine.view.Position} viewPosition View position to be mapped.
 * @param {Object} data Data pipeline object that can store and pass data between callbacks. The callback should add
 * `modelPosition` value to that object with calculated {@link engine.model.Position model position}.
 */
