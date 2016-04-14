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
 *		modelDispatcher.on( 'insert:paragraph', insertElement( new ViewElement( 'p' ) ) );
 *
 *		modelDispatcher.on(
 *			'insert:myElem',
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

		conversionApi.mapper.bindElements( data.item, viewElement );
		conversionApi.writer.insert( viewPosition, viewElement );

		evt.stop();
	};
}

/**
 * Function factory, creates a default model-to-view converter for text insertion changes.
 *
 * The converter automatically consumes corresponding value from consumables list and stops the event (see
 * {@link engine.treeController.ModelConversionDispatcher}).
 *
 *		modelDispatcher.on( 'insert:$text', insertText() );
 *
 * @external engine.treeController.modelToView
 * @function engine.treeController.modelToView.insertText
 * @returns {Function} Insert text event converter.
 */
export function insertText() {
	return ( evt, data, consumable, conversionApi ) => {
		consumable.consume( data.item, 'insert' );

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
		const viewText = new ViewText( data.item.text );

		conversionApi.writer.insert( viewPosition, viewText );

		evt.stop();
	};
}

/**
 * Function factory, creates a converter that converts set/change attribute changes from the model to the view. Attributes
 * from model are converted to the view element attributes in the view. You may provide a custom function to generate a
 * key-value attribute pair to add/change. If not provided, model attributes will be converted to view elements attributes
 * on 1-to-1 basis.
 *
 * **Note:** Provided attribute creator should always return the same `key` for given attribute from the model.
 *
 * The converter automatically consumes corresponding value from consumables list and stops the event (see
 * {@link engine.treeController.ModelConversionDispatcher}).
 *
 *		modelDispatcher.on( 'addAttribute:customAttr:myElem', setAttribute( ( data ) => {
 *			// Change attribute key from `customAttr` to `class` in view.
 *			const key = 'class';
 *			let value = data.attributeNewValue;
 *
 *			// Force attribute value to 'empty' if the model element is empty.
 *			if ( data.item.getChildCount() === 0 ) {
 *				value = 'empty';
 *			}
 *
 *			// Return key-value pair.
 *			return { key, value };
 *		} ) );
 *
 * @external engine.treeController.modelToView
 * @function engine.treeController.modelToView.setAttribute
 * @param {Function} [attributeCreator] Function returning an object with two properties: `key` and `value`, which
 * represents attribute key and attribute value to be set on a {@link engine.treeView.Element view element}. The function
 * is passed all the parameters of the {@link engine.treeController.ModelConversionDispatcher.addAttribute}
 * or {@link engine.treeController.ModelConversionDispatcher.changeAttribute) event.
 * @returns {Function} Set/change attribute converter.
 */
export function setAttribute( attributeCreator ) {
	attributeCreator = attributeCreator || ( ( data ) => ( { key: data.attributeKey, value: data.attributeNewValue } ) );

	return ( evt, data, consumable, conversionApi ) => {
		const { key, value } = attributeCreator( data, consumable, conversionApi );

		consumable.consume( data.item, eventNameToConsumableType( evt.name ) );
		conversionApi.mapper.toViewElement( data.item ).setAttribute( key, value );

		evt.stop();
	};
}

/**
 * Function factory, creates a converter that converts remove attribute changes from the model to the view. Removes attributes
 * that were converted to the view element attributes in the view. You may provide a custom function to generate a
 * key-value attribute pair to remove. If not provided, model attributes will be removed from view elements on 1-to-1 basis.
 *
 * **Note:** Provided attribute creator should always return the same `key` for given attribute from the model.
 *
 * **Note:** You can use the same attribute creator as in {@link engine.treeController.modelToView.setAttribute}.
 *
 * The converter automatically consumes corresponding value from consumables list and stops the event (see
 * {@link engine.treeController.ModelConversionDispatcher}).
 *
 *		modelDispatcher.on( 'removeAttribute:customAttr:myElem', removeAttribute( ( data ) => {
 *			// Change attribute key from `customAttr` to `class` in view.
 *			const key = 'class';
 *			let value = data.attributeNewValue;
 *
 *			// Force attribute value to 'empty' if the model element is empty.
 *			if ( data.item.getChildCount() === 0 ) {
 *				value = 'empty';
 *			}
 *
 *			// Return key-value pair.
 *			return { key, value };
 *		} ) );
 *
 * @external engine.treeController.modelToView
 * @function engine.treeController.modelToView.removeAttribute
 * @param {Function} [attributeCreator] Function returning an object with two properties: `key` and `value`, which
 * represents attribute key and attribute value to be removed from {@link engine.treeView.Element view element}. The function
 * is passed all the parameters of the {@link engine.treeController.ModelConversionDispatcher.addAttribute}
 * or {@link engine.treeController.ModelConversionDispatcher.changeAttribute) event.
 * @returns {Function} Remove attribute converter.
 */
export function removeAttribute( attributeCreator ) {
	attributeCreator = attributeCreator || ( ( data ) => ( { key: data.attributeKey } ) );

	return ( evt, data, consumable, conversionApi ) => {
		const { key } = attributeCreator( data, consumable, conversionApi );

		consumable.consume( data.item, eventNameToConsumableType( evt.name ) );
		conversionApi.mapper.toViewElement( data.item ).removeAttribute( key );

		evt.stop();
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
 * {@link engine.treeController.ModelConversionDispatcher}).
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
			elementCreator( data.attributeNewValue, data, consumable, conversionApi );

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
			elementCreator( data.attributeOldValue, data, consumable, conversionApi );

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
		const targetViewPosition = conversionApi.mapper.toViewPosition( data.range.start );

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

/**
 * Returns the consumable type that is to be consumed in an event, basing on that event name.
 *
 * @param {String} evtName Event name.
 * @returns {String} Consumable type.
 */
export function eventNameToConsumableType( evtName ) {
	const parts = evtName.split( ':' );

	return parts[ 0 ] + ':' + parts[ 1 ];
}
