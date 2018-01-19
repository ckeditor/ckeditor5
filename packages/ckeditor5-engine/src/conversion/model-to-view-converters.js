/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelRange from '../model/range';

import ViewElement from '../view/element';
import ViewAttributeElement from '../view/attributeelement';
import ViewText from '../view/text';
import ViewRange from '../view/range';

/**
 * Contains model to view converters for
 * {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher}.
 *
 * @module engine/conversion/model-to-view-converters
 */

/**
 * Function factory, creates a converter that converts node insertion changes from the model to the view.
 * The view element that will be added to the view depends on passed parameter. If {@link module:engine/view/element~Element} was passed,
 * it will be cloned and the copy will be inserted. If `Function` is provided, it is passed all the parameters of the
 * dispatcher's {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:insert insert event}.
 * It's expected that the function returns a {@link module:engine/view/element~Element}.
 * The result of the function will be inserted to the view.
 *
 * The converter automatically consumes corresponding value from consumables list, stops the event (see
 * {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher}) and bind model and view elements.
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
 * @param {module:engine/view/element~Element|Function} elementCreator View element, or function returning a view element, which
 * will be inserted.
 * @returns {Function} Insert element event converter.
 */
export function insertElement( elementCreator ) {
	return ( evt, data, consumable, conversionApi ) => {
		const viewElement = ( elementCreator instanceof ViewElement ) ?
			elementCreator.clone( true ) :
			elementCreator( data, consumable, conversionApi );

		if ( !viewElement ) {
			return;
		}

		if ( !consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );

		conversionApi.mapper.bindElements( data.item, viewElement );
		conversionApi.writer.insert( viewPosition, viewElement );
	};
}

/**
 * Function factory, creates a default model-to-view converter for text insertion changes.
 *
 * The converter automatically consumes corresponding value from consumables list and stops the event (see
 * {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher}).
 *
 *		modelDispatcher.on( 'insert:$text', insertText() );
 *
 * @returns {Function} Insert text event converter.
 */
export function insertText() {
	return ( evt, data, consumable, conversionApi ) => {
		if ( !consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const viewPosition = conversionApi.mapper.toViewPosition( data.range.start );
		const viewText = new ViewText( data.item.data );

		conversionApi.writer.insert( viewPosition, viewText );
	};
}

/**
 * Function factory, creates a default model-to-view converter for node remove changes.
 *
 *		modelDispatcher.on( 'remove', remove() );
 *
 * @returns {Function} Remove event converter.
 */
export function remove() {
	return ( evt, data, conversionApi ) => {
		// Find view range start position by mapping model position at which the remove happened.
		const viewStart = conversionApi.mapper.toViewPosition( data.position );

		const modelEnd = data.position.getShiftedBy( data.length );
		const viewEnd = conversionApi.mapper.toViewPosition( modelEnd, { isPhantom: true } );

		const viewRange = new ViewRange( viewStart, viewEnd );

		// Trim the range to remove in case some UI elements are on the view range boundaries.
		const removed = conversionApi.writer.remove( viewRange.getTrimmed() );

		// After the range is removed, unbind all view elements from the model.
		// Range inside view document fragment is used to unbind deeply.
		for ( const child of ViewRange.createIn( removed ).getItems() ) {
			conversionApi.mapper.unbindViewElement( child );
		}
	};
}

/**
 * Function factory, creates a converter that converts marker adding change to the view ui element.
 * The view ui element that will be added to the view depends on passed parameter. See {@link ~insertElement}.
 * In a case of collapsed range element will not wrap range but separate elements will be placed at the beginning
 * and at the end of the range.
 *
 * **Note:** unlike {@link ~insertElement}, the converter does not bind view element to model, because this converter
 * uses marker as "model source of data". This means that view ui element does not have corresponding model element.
 *
 * @param {module:engine/view/uielement~UIElement|Function} elementCreator View ui element, or function returning a view element, which
 * will be inserted.
 * @returns {Function} Insert element event converter.
 */
export function insertUIElement( elementCreator ) {
	return ( evt, data, consumable, conversionApi ) => {
		let viewStartElement, viewEndElement;

		// Create two view elements. One will be inserted at the beginning of marker, one at the end.
		// If marker is collapsed, only "opening" element will be inserted.
		if ( elementCreator instanceof ViewElement ) {
			viewStartElement = elementCreator.clone( true );
			viewEndElement = elementCreator.clone( true );
		} else {
			data.isOpening = true;
			viewStartElement = elementCreator( data, conversionApi );

			data.isOpening = false;
			viewEndElement = elementCreator( data, conversionApi );
		}

		if ( !viewStartElement || !viewEndElement ) {
			return;
		}

		const markerRange = data.markerRange;

		// Marker that is collapsed has consumable build differently that non-collapsed one.
		// For more information see `addMarker` event description.
		// If marker's range is collapsed - check if it can be consumed.
		if ( markerRange.isCollapsed && !consumable.consume( markerRange, evt.name ) ) {
			return;
		}

		// If marker's range is not collapsed - consume all items inside.
		for ( const value of markerRange ) {
			if ( !consumable.consume( value.item, evt.name ) ) {
				return;
			}
		}

		const mapper = conversionApi.mapper;
		const writer = conversionApi.writer;

		// Add "opening" element.
		writer.insert( mapper.toViewPosition( markerRange.start ), viewStartElement );

		// Add "closing" element only if range is not collapsed.
		if ( !markerRange.isCollapsed ) {
			writer.insert( mapper.toViewPosition( markerRange.end ), viewEndElement );
		}

		evt.stop();
	};
}

/**
 * Function factory, creates a default model-to-view converter for removing {@link module:engine/view/uielement~UIElement ui element}
 * basing on marker remove change.
 *
 * @param {module:engine/view/uielement~UIElement|Function} elementCreator View ui element, or function returning
 * a view ui element, which will be used as a pattern when look for element to remove at the marker start position.
 * @returns {Function} Remove ui element converter.
 */
export function removeUIElement( elementCreator ) {
	return ( evt, data, conversionApi ) => {
		let viewStartElement, viewEndElement;

		// Create two view elements. One will be used to remove "opening element", the other for "closing element".
		// If marker was collapsed, only "opening" element will be removed.
		if ( elementCreator instanceof ViewElement ) {
			viewStartElement = elementCreator.clone( true );
			viewEndElement = elementCreator.clone( true );
		} else {
			data.isOpening = true;
			viewStartElement = elementCreator( data, conversionApi );

			data.isOpening = false;
			viewEndElement = elementCreator( data, conversionApi );
		}

		if ( !viewStartElement || !viewEndElement ) {
			return;
		}

		const markerRange = data.markerRange;
		const writer = conversionApi.writer;

		// When removing the ui elements, we map the model range to view twice, because that view range
		// may change after the first clearing.
		if ( !markerRange.isCollapsed ) {
			writer.clear( conversionApi.mapper.toViewRange( markerRange ).getEnlarged(), viewEndElement );
		}

		// Remove "opening" element.
		writer.clear( conversionApi.mapper.toViewRange( markerRange ).getEnlarged(), viewStartElement );

		evt.stop();
	};
}

/**
 * Function factory, creates a converter that converts set/change/remove attribute changes from the model to the view.
 *
 * Attributes from model are converted to the view element attributes in the view. You may provide a custom function to generate
 * a key-value attribute pair to add/change/remove. If not provided, model attributes will be converted to view elements
 * attributes on 1-to-1 basis.
 *
 * **Note:** Provided attribute creator should always return the same `key` for given attribute from the model.
 *
 * The converter automatically consumes corresponding value from consumables list and stops the event (see
 * {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher}).
 *
 *		modelDispatcher.on( 'attribute:customAttr:myElem', changeAttribute( ( data ) => {
 *			// Change attribute key from `customAttr` to `class` in view.
 *			const key = 'class';
 *			let value = data.attributeNewValue;
 *
 *			// Force attribute value to 'empty' if the model element is empty.
 *			if ( data.item.childCount === 0 ) {
 *				value = 'empty';
 *			}
 *
 *			// Return key-value pair.
 *			return { key, value };
 *		} ) );
 *
 * @param {Function} [attributeCreator] Function returning an object with two properties: `key` and `value`, which
 * represents attribute key and attribute value to be set on a {@link module:engine/view/element~Element view element}.
 * The function is passed all the parameters of the
 * {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:attribute} event.
 * @returns {Function} Set/change attribute converter.
 */
export function changeAttribute( attributeCreator ) {
	attributeCreator = attributeCreator || ( ( value, key ) => ( { value, key } ) );

	return ( evt, data, consumable, conversionApi ) => {
		if ( !consumable.consume( data.item, evt.name ) ) {
			return;
		}

		const { key, value } = attributeCreator( data.attributeNewValue, data.attributeKey, data, consumable, conversionApi );

		if ( data.attributeNewValue !== null ) {
			conversionApi.mapper.toViewElement( data.item ).setAttribute( key, value );
		} else {
			conversionApi.mapper.toViewElement( data.item ).removeAttribute( key );
		}
	};
}

/**
 * Function factory, creates a converter that converts set/change/remove attribute changes from the model to the view.
 *
 * Attributes from model are converted to a view element that will be wrapping those view nodes that are bound to
 * model elements having given attribute. This is useful for attributes like `bold`, which may be set on text nodes in model
 * but are represented as an element in the view:
 *
 *		[paragraph]              MODEL ====> VIEW        <p>
 *			|- a {bold: true}                             |- <b>
 *			|- b {bold: true}                             |   |- ab
 *			|- c                                          |- c
 *
 * The wrapping node depends on passed parameter. If {@link module:engine/view/element~Element} was passed, it will be cloned and
 * the copy will become the wrapping element. If `Function` is provided, it is passed attribute value and then all the parameters of the
 * {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher#event:attribute attribute event}.
 * It's expected that the function returns a {@link module:engine/view/element~Element}.
 * The result of the function will be the wrapping element.
 * When provided `Function` does not return element, then will be no conversion.
 *
 * The converter automatically consumes corresponding value from consumables list, stops the event (see
 * {@link module:engine/conversion/modelconversiondispatcher~ModelConversionDispatcher}).
 *
 *		modelDispatcher.on( 'attribute:bold', wrapItem( new ViewAttributeElement( 'strong' ) ) );
 *
 * @param {module:engine/view/element~Element|Function} elementCreator View element, or function returning a view element, which will
 * be used for wrapping.
 * @returns {Function} Set/change attribute converter.
 */
export function wrap( elementCreator ) {
	return ( evt, data, consumable, conversionApi ) => {
		// Recreate current wrapping node. It will be used to unwrap view range if the attribute value has changed
		// or the attribute was removed.
		const oldViewElement = ( elementCreator instanceof ViewElement ) ?
			elementCreator.clone( true ) :
			elementCreator( data.attributeOldValue, data, consumable, conversionApi );

		// Create node to wrap with.
		const newViewElement = ( elementCreator instanceof ViewElement ) ?
			elementCreator.clone( true ) :
			elementCreator( data.attributeNewValue, data, consumable, conversionApi );

		if ( !oldViewElement && !newViewElement ) {
			return;
		}

		if ( !consumable.consume( data.item, evt.name ) ) {
			return;
		}

		let viewRange = conversionApi.mapper.toViewRange( data.range );
		const writer = conversionApi.writer;

		// First, unwrap the range from current wrapper.
		if ( data.attributeOldValue !== null ) {
			viewRange = writer.unwrap( viewRange, oldViewElement );
		}

		// Then wrap with the new wrapper.
		if ( data.attributeNewValue !== null ) {
			writer.wrap( viewRange, newViewElement );
		}
	};
}

/**
 * Function factory, creates converter that converts text inside marker's range. Converter wraps the text with
 * {@link module:engine/view/attributeelement~AttributeElement} created from provided descriptor.
 * See {link module:engine/conversion/model-to-view-converters~createViewElementFromHighlightDescriptor}.
 *
 * If the highlight descriptor will not provide `priority` property, `10` will be used.
 *
 * If the highlight descriptor will not provide `id` property, name of the marker will be used.
 *
 * @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor|Function} highlightDescriptor
 * @return {Function}
 */
export function highlightText( highlightDescriptor ) {
	return ( evt, data, consumable, conversionApi ) => {
		if ( data.markerRange.isCollapsed ) {
			return;
		}

		const modelItem = data.item;

		if ( !modelItem.is( 'textProxy' ) ) {
			return;
		}

		const descriptor = _prepareDescriptor( highlightDescriptor, data, conversionApi );

		if ( !descriptor ) {
			return;
		}

		if ( !consumable.consume( modelItem, evt.name ) ) {
			return;
		}

		const viewElement = createViewElementFromHighlightDescriptor( descriptor );
		const viewRange = conversionApi.mapper.toViewRange( data.range );

		conversionApi.writer.wrap( viewRange, viewElement );
	};
}

/**
 * Converter function factory. Creates a function which applies the marker's highlight to an element inside the marker's range.
 *
 * The converter checks if an element has `addHighlight` function stored as
 * {@link module:engine/view/element~Element#setCustomProperty custom property} and, if so, uses it to apply the highlight.
 * In such case converter will consume all element's children, assuming that they were handled by element itself.
 *
 * When `addHighlight` custom property is not present, element is not converted in any special way.
 * This means that converters will proceed to convert element's child nodes.
 *
 * If the highlight descriptor will not provide `priority` property, `10` will be used.
 *
 * If the highlight descriptor will not provide `id` property, name of the marker will be used.
 *
 * @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor|Function} highlightDescriptor
 * @return {Function}
 */
export function highlightElement( highlightDescriptor ) {
	return ( evt, data, consumable, conversionApi ) => {
		if ( data.markerRange.isCollapsed ) {
			return;
		}

		const modelItem = data.item;

		if ( !modelItem.is( 'element' ) ) {
			return;
		}

		const descriptor = _prepareDescriptor( highlightDescriptor, data, conversionApi );

		if ( !descriptor ) {
			return;
		}

		if ( !consumable.test( modelItem, evt.name ) ) {
			return;
		}

		const viewElement = conversionApi.mapper.toViewElement( modelItem );

		if ( viewElement && viewElement.getCustomProperty( 'addHighlight' ) ) {
			// Consume element itself.
			consumable.consume( data.item, evt.name );

			// Consume all children nodes.
			for ( const value of ModelRange.createIn( modelItem ) ) {
				consumable.consume( value.item, evt.name );
			}

			viewElement.getCustomProperty( 'addHighlight' )( viewElement, descriptor );
		}
	};
}

/**
 * Function factory, creates a converter that converts model marker remove to the view.
 *
 * Both text nodes and elements are handled by this converter by they are handled a bit differently.
 *
 * Text nodes are unwrapped using {@link module:engine/view/attributeelement~AttributeElement} created from provided
 * highlight descriptor. See {link module:engine/conversion/model-to-view-converters~highlightDescriptorToAttributeElement}.
 *
 * For elements, the converter checks if an element has `removeHighlight` function stored as
 * {@link module:engine/view/element~Element#setCustomProperty custom property}. If so, it uses it to remove the highlight.
 * In such case, children of that element will not be converted.
 *
 * When `removeHighlight` is not present, element is not converted in any special way.
 * Instead converter will proceed to convert element's child nodes.
 *
 * If the highlight descriptor will not provide `priority` property, `10` will be used.
 *
 * If the highlight descriptor will not provide `id` property, name of the marker will be used.
 *
 * @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor|Function} highlightDescriptor
 * @return {Function}
 */
export function removeHighlight( highlightDescriptor ) {
	return ( evt, data, conversionApi ) => {
		// This conversion makes sense only for non-collapsed range.
		if ( data.markerRange.isCollapsed ) {
			return;
		}

		const descriptor = _prepareDescriptor( highlightDescriptor, data, conversionApi );

		if ( !descriptor ) {
			return;
		}

		const viewRange = conversionApi.mapper.toViewRange( data.markerRange );

		// Retrieve all items in the affected range. We will process them and remove highlight from them appropriately.
		const items = new Set( viewRange.getItems() );

		// First, iterate through all items and remove highlight from those container elements that have custom highlight handling.
		for ( const item of items ) {
			if ( item.is( 'containerElement' ) && item.getCustomProperty( 'removeHighlight' ) ) {
				item.getCustomProperty( 'removeHighlight' )( item, descriptor.id );

				// If container element had custom handling, remove all it's children from further processing.
				for ( const descendant of ViewRange.createIn( item ) ) {
					items.delete( descendant );
				}
			}
		}

		// Then, iterate through all other items. Look for text nodes and unwrap them. Start from the end
		// to prevent errors when view structure changes when unwrapping (and, for example, some attributes are merged).
		const viewHighlightElement = createViewElementFromHighlightDescriptor( descriptor );

		for ( const item of Array.from( items ).reverse() ) {
			if ( item.is( 'textProxy' ) ) {
				conversionApi.writer.unwrap( ViewRange.createOn( item ), viewHighlightElement );
			}
		}
	};
}

// Helper function for `highlight`. Prepares the actual descriptor object using value passed to the converter.
function _prepareDescriptor( highlightDescriptor, data, conversionApi ) {
	// If passed descriptor is a creator function, call it. If not, just use passed value.
	const descriptor = typeof highlightDescriptor == 'function' ?
		highlightDescriptor( data, conversionApi ) :
		highlightDescriptor;

	if ( !descriptor ) {
		return null;
	}

	// Apply default descriptor priority.
	if ( !descriptor.priority ) {
		descriptor.priority = 10;
	}

	// Default descriptor id is marker name.
	if ( !descriptor.id ) {
		descriptor.id = data.markerName;
	}

	return descriptor;
}

/**
 * Creates `span` {@link module:engine/view/attributeelement~AttributeElement view attribute element} from information
 * provided by {@link module:engine/conversion/model-to-view-converters~HighlightDescriptor} object. If priority
 * is not provided in descriptor - default priority will be used.
 *
 * @param {module:engine/conversion/model-to-view-converters~HighlightDescriptor} descriptor
 * @return {module:engine/conversion/model-to-view-converters~HighlightAttributeElement}
 */
export function createViewElementFromHighlightDescriptor( descriptor ) {
	const viewElement = new HighlightAttributeElement( 'span', descriptor.attributes );

	if ( descriptor.class ) {
		const cssClasses = Array.isArray( descriptor.class ) ? descriptor.class : [ descriptor.class ];
		viewElement.addClass( ...cssClasses );
	}

	if ( descriptor.priority ) {
		viewElement.priority = descriptor.priority;
	}

	viewElement.setCustomProperty( 'highlightDescriptorId', descriptor.id );

	return viewElement;
}

/**
 * Special kind of {@link module:engine/view/attributeelement~AttributeElement} that is created and used in
 * marker-to-highlight conversion.
 *
 * The difference between `HighlightAttributeElement` and {@link module:engine/view/attributeelement~AttributeElement}
 * is {@link module:engine/view/attributeelement~AttributeElement#isSimilar} method.
 *
 * For `HighlightAttributeElement` it checks just `highlightDescriptorId` custom property, that is set during marker-to-highlight
 * conversion basing on {@link module:engine/conversion/model-to-view-converters~HighlightDescriptor} object.
 * `HighlightAttributeElement`s with same `highlightDescriptorId` property are considered similar.
 */
class HighlightAttributeElement extends ViewAttributeElement {
	isSimilar( otherElement ) {
		if ( otherElement.is( 'attributeElement' ) ) {
			return this.getCustomProperty( 'highlightDescriptorId' ) === otherElement.getCustomProperty( 'highlightDescriptorId' );
		}

		return false;
	}
}

/**
 * Object describing how the content highlight should be created in the view.
 *
 * Each text node contained in the highlight will be wrapped with `span` element with CSS class(es), attributes and priority
 * described by this object.
 *
 * Each element can handle displaying the highlight separately by providing `addHighlight` and `removeHighlight` custom
 * properties:
 *  * `HighlightDescriptor` is passed to the `addHighlight` function upon conversion and should be used to apply the highlight to
 *  the element,
 *  * descriptor id is passed to the `removeHighlight` function upon conversion and should be used to remove the highlight of given
 *  id from the element.
 *
 * @typedef {Object} module:engine/conversion/model-to-view-converters~HighlightDescriptor
 *
 * @property {String|Array.<String>} class CSS class or array of classes to set. If descriptor is used to
 * create {@link module:engine/view/attributeelement~AttributeElement} over text nodes, those classes will be set
 * on that {@link module:engine/view/attributeelement~AttributeElement}. If descriptor is applied to an element,
 * usually those class will be set on that element, however this depends on how the element converts the descriptor.
 *
 * @property {String} [id] Descriptor identifier. If not provided, defaults to converted marker's name.
 *
 * @property {Number} [priority] Descriptor priority. If not provided, defaults to `10`. If descriptor is used to create
 * {@link module:engine/view/attributeelement~AttributeElement}, it will be that element's
 * {@link module:engine/view/attributeelement~AttributeElement#priority}. If descriptor is applied to an element,
 * the priority will be used to determine which descriptor is more important.
 *
 * @property {Object} [attributes] Attributes to set. If descriptor is used to create
 * {@link module:engine/view/attributeelement~AttributeElement} over text nodes, those attributes will be set on that
 * {@link module:engine/view/attributeelement~AttributeElement}. If descriptor is applied to an element, usually those
 * attributes will be set on that element, however this depends on how the element converts the descriptor.
 */
