/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ModelTreeWalker from '../treemodel/treewalker.js';
import ModelRange from '../treemodel/range.js';

import ViewElement from '../treeview/element.js';
import ViewText from '../treeview/text.js';

/**
 * Contains {@link engine.treeModel model} to {@link engine.treeView view} converters for
 * {@link engine.treeController.ModelConversionDispatcher}.
 *
 * @namespace engine.treeController.modelToView
 */

/**
 * Function factory, creates a converter that converts node insertion changes from the model to the view.
 * The view element that will be added to the view depends on passed parameter. If {@link engine.treeView.Element} was passed,
 * it will be cloned and the copy will be inserted. If `Function` is provided, it is passed all the parameters of the
 * {@link engine.treeController.ModelConversionDispatcher.insert dispatcher's insert event}. It's expected that the
 * function returns a {@link engine.treeView.Element}. The result of the function will be inserted to the view.
 *
 * The converter automatically consumes corresponding value from consumables list, stops the event (see
 * {@link engine.treeController.ModelConversionDispatcher}) and bind model and view elements.
 *
 *		modelDispatcher.on( 'insert:element:p', insertElement( new ViewElement( 'p' ) ) );
 *
 *		modelDispatcher.on(
 *			'insert:element:myElem',
 *			insertElement( ( data, consumable, conversionApi ) => {
 *				let myElem = new ViewElement( 'myElem', { myAttr: true }, new ViewText( 'myText' ) );
 *
 *				// Do something fancy with myElem using data/consumable/conversionApi ...
 *
 *				return myElem;
 *			}
 *		) );
 *
 * @external engine.treeController.modelToView
 * @function engine.treeController.modelToView.insertElement
 * @param {engine.treeView.Element|Function} elementCreator View element, or function returning a view element, which
 * will be inserted.
 * @returns {Function} Insert element event converter.
 */
export function insertElement( elementCreator ) {
	return ( evt, data, consumable, conversionApi ) => {
		consumable.consume( data.item, 'insert' );

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
		const viewElement = ( elementCreator instanceof ViewElement ) ?
			elementCreator.clone( true ) :
			elementCreator( data, consumable, conversionApi );

		conversionApi.mapper.bind( data.item, viewElement );
		conversionApi.writer.insert( viewPosition, viewElement );

		evt.stop();
	};
}

/**
 * Function factory, creates a default model-to-view converter for text insertion changes.
 *
 * The converter automatically consumes corresponding value from consumables list, stops the event (see
 * {@link engine.treeController.ModelConversionDispatcher}) and bind model and view elements.
 *
 *		modelDispatcher.on( 'insert:text', insertText() );
 *
 * @external engine.treeController.modelToView
 * @function engine.treeController.modelToView.insertText
 * @returns {Function} Insert text event converter.
 */
export function insertText() {
	return ( evt, data, consumable, conversionApi ) => {
		consumable.consume( data.item, 'insert' );

		const viewPosition = conversionApi.mapper.toViewPosition( data.position );
		const viewText = new ViewText( data.item.data );

		conversionApi.writer.insert( viewPosition, viewText );

		evt.stop();
	};
}

/**
 * Function factory, creates a converter that converts set/change attribute changes from the model to the view. Attributes
 * from model are converted to the attributes in the view. You may provide a custom function to generate a set of attributes
 * that will be added/changed. If not provided, model attributes will be converted to view elements attributes on 1-to-1 basis.
 *
 * The converter automatically consumes corresponding value from consumables list, stops the event (see
 * {@link engine.treeController.ModelConversionDispatcher}) and bind model and view elements.
 *
 *		modelDispatcher.on( 'addAttribute:customAttr:myElem', setAttribute( ( data ) => {
 *			let attributes = {};
 *
 *			if ( data.item.hasAttribute( 'otherCustomAttr' ) ) {
 *				// do something with attributes variable ...
 *			} else {
 *				// do something else with attributes variable ...
 *			}
 *
 *			return attributes;
 *		} ) );
 *
 * @external engine.treeController.modelToView
 * @function engine.treeController.modelToView.setAttribute
 * @param {Function} [attributesCreator] Function returning a `string`, `number` or an `object` which values are `string`s
 * or `number`s. If `object` is returned, it's keys are used as attributes keys and values as attributes values. The function
 * is passed all the parameters of the {@link engine.treeController.ModelConversionDispatcher.addAttribute}
 * or {@link engine.treeController.ModelConversionDispatcher.changeAttribute) event.
 * @returns {Function} Set/change attribute converter.
 */
export function setAttribute( attributesCreator ) {
	return ( evt, data, consumable, conversionApi ) => {
		let attributes;

		if ( !attributesCreator ) {
			attributes = data.item.getAttribute( data.attributeKey );
		} else {
			attributes = attributesCreator( data, consumable, conversionApi );
		}

		if ( attributes ) {
			consumable.consume( data.item, eventNameToConsumableType( evt.name ) );

			const viewElement = conversionApi.mapper.toViewElement( data.item );

			if ( typeof attributes === 'string' || typeof attributes === 'number' ) {
				viewElement.setAttribute( data.attributeKey, attributes );
			} else {
				for ( let attributeKey in attributes ) {
					viewElement.setAttribute( attributeKey, attributes[ attributeKey ] );
				}
			}

			evt.stop();
		}
	};
}

/**
 * Function factory, creates a converter that converts remove attribute changes from the model to the view. This converter
 * assumes, that attributes from model were converted to the attributes in the view. You may provide a custom function to
 * generate a set of attributes that will be removed. If not provided, model attributes will be removed from view elements on 1-to-1 basis.
 *
 * The converter automatically consumes corresponding value from consumables list, stops the event (see
 * {@link engine.treeController.ModelConversionDispatcher}) and bind model and view elements.
 *
 *		modelDispatcher.on( 'removeAttribute:customAttr:myElem', removeAttribute( ( data ) => {
 *			let attributes = {};
 *
 *			if ( data.item.hasAttribute( 'otherCustomAttr' ) ) {
 *				// do something with attributes variable ...
 *			} else {
 *				// do something else with attributes variable ...
 *			}
 *
 *			return attributes;
 *		} ) );
 *
 * @external engine.treeController.modelToView
 * @function engine.treeController.modelToView.removeAttribute
 * @param {Function} [attributesCreator] Function returning a `string` or an `array` of `string`s. If `array` is returned,
 * it's values are used as attributes keys to remove. The function is passed all the parameters of the
 * {@link engine.treeController.ModelConversionDispatcher.removeAttribute} event.
 * @returns {Function} Remove attribute converter.
 */
export function removeAttribute( attributesCreator ) {
	return ( evt, data, consumable, conversionApi ) => {
		let attributeKeys;

		if ( !attributesCreator ) {
			attributeKeys = data.attributeKey;
		} else {
			attributeKeys = attributesCreator( data, consumable, conversionApi );
		}

		if ( attributeKeys ) {
			consumable.consume( data.item, eventNameToConsumableType( evt.name ) );

			const viewElement = conversionApi.mapper.toViewElement( data.item );

			if ( typeof attributeKeys === 'string' ) {
				viewElement.removeAttribute( attributeKeys );
			} else {
				for ( let attributeKey of attributeKeys ) {
					viewElement.removeAttribute( attributeKey );
				}
			}

			evt.stop();
		}
	};
}

/**
 * Function factory, creates a converter that converts set/change attribute changes from the model to the view. In this case,
 * model attributes are converted to a view element that will be wrapping view nodes which corresponding model nodes had
 * the attribute set. This is useful for attributes like `bold`, which may be set on a text nodes in model but are
 * represented as an element in the view:
 *
 *		[paragraph]              MODEL ====> VIEW        <p>
 *			|- a {bold: true}                             |- <b>
 *			|- b {bold: true}                             |   |- ab
 *			|- c                                          |- c
 *
 * The wrapping node depends on passed parameter. If {@link engine.treeView.Element} was passed, it will be cloned and
 * the copy will become the wrapping element. If `Function` is provided, it is passed all the parameters of the
 * {@link engine.treeController.ModelConversionDispatcher.setAttribute event}. It's expected that the
 * function returns a {@link engine.treeView.Element}. The result of the function will be the wrapping element.
 *
 * The converter automatically consumes corresponding value from consumables list, stops the event (see
 * {@link engine.treeController.ModelConversionDispatcher}) and bind model and view elements.
 *
 *		modelDispatcher.on( 'addAttribute:bold', wrap( new ViewElement( 'strong' ) ) );
 *
 * @external engine.treeController.modelToView
 * @function engine.treeController.modelToView.wrap
 * @param {engine.treeView.Element|Function} elementCreator View element, or function returning a view element, which will
 * be used for wrapping.
 * @returns {Function} Set/change attribute converter.
 */
export function wrap( elementCreator ) {
	return ( evt, data, consumable, conversionApi ) => {
		consumable.consume( data.item, eventNameToConsumableType( evt.name ) );

		const viewRange = conversionApi.mapper.toViewRange( data.range );

		const viewElement = ( elementCreator instanceof ViewElement ) ?
			elementCreator.clone( true ) :
			elementCreator( data, consumable, conversionApi );

		conversionApi.writer.wrap( viewRange, viewElement, evt.priority );

		evt.stop();
	};
}

/**
 * Function factory, creates a converter that converts remove attribute changes from the model to the view. It assumes, that
 * attributes from model were converted to elements in the view. This converter will unwrap view nodes from corresponding
 * view element if given attribute was removed.
 *
 * The view element type that will be unwrapped depends on passed parameter.
 * If {@link engine.treeView.Element} was passed, it will be used to look for similar element in the view for unwrapping. If `Function`
 * is provided, it is passed all the parameters of the {@link engine.treeController.ModelConversionDispatcher.setAttribute event}.
 * It's expected that the function returns a {@link engine.treeView.Element}. The result of the function will be used to
 * look for similar element in the view for unwrapping.
 *
 * The converter automatically consumes corresponding value from consumables list, stops the event (see
 * {@link engine.treeController.ModelConversionDispatcher}) and bind model and view elements.
 *
 *		modelDispatcher.on( 'removeAttribute:bold', unwrap( new ViewElement( 'strong' ) ) );
 *
 * @see engine.treeController.modelToView.wrap
 * @external engine.treeController.modelToView
 * @function engine.treeController.modelToView.unwrap
 * @param {engine.treeView.Element|Function} elementCreator View element, or function returning a view element, which will
 * be used for unwrapping.
 * @returns {Function} Remove attribute converter.
 */
export function unwrap( elementCreator ) {
	return ( evt, data, consumable, conversionApi ) => {
		consumable.consume( data.item, eventNameToConsumableType( evt.name ) );

		const viewRange = conversionApi.mapper.toViewRange( data.range );
		const viewNode = ( elementCreator instanceof ViewElement ) ?
			elementCreator.clone( true ) :
			elementCreator( data, consumable, conversionApi );

		conversionApi.writer.unwrap( viewRange, viewNode );

		evt.stop();
	};
}

/**
 * Function factory, creates a default model-to-view converter for nodes move changes.
 *
 *		modelDispatcher.on( 'move', move() );
 *
 * @external engine.treeController.modelToView
 * @function engine.treeController.modelToView.move
 * @returns {Function} Move event converter.
 */
export function move() {
	return ( evt, data, conversionApi ) => {
		const walker = new ModelTreeWalker( { boundaries: data.range, shallow: true } );

		let length = 0;

		for ( let value of walker ) {
			length += value.length;
		}

		const sourceModelRange = ModelRange.createFromPositionAndShift( data.sourcePosition, length );

		const sourceViewRange = conversionApi.mapper.toViewRange( sourceModelRange );
		const targetViewPosition = conversionApi.mapper.toViewRange( data.range.start );

		conversionApi.writer.move( sourceViewRange, targetViewPosition );
	};
}

/**
 * Function factory, creates a default model-to-view converter for nodes remove changes.
 *
 *		modelDispatcher.on( 'remove', remove() );
 *
 * @external engine.treeController.modelToView
 * @function engine.treeController.modelToView.remove
 * @returns {Function} Remove event converter.
 */
export function remove() {
	return ( evt, data, conversionApi ) => {
		const walker = new ModelTreeWalker( { boundaries: data.range, shallow: true } );

		let length = 0;

		for ( let value of walker ) {
			length += value.length;
		}

		const sourceModelRange = ModelRange.createFromPositionAndShift( data.sourcePosition, length );
		const sourceViewRange = conversionApi.mapper.toViewRange( sourceModelRange );

		conversionApi.writer.remove( sourceViewRange );
	};
}

function eventNameToConsumableType( evtName ) {
	const parts = evtName.split( ':' );

	return parts[ 0 ] + ':' + parts[ 1 ];
}
