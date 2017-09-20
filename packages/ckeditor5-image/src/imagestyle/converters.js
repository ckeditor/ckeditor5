/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/converters
 */

import { isImage } from '../image/utils';

/**
 * Returns a converter for the `imageStyle` attribute. It can be used for adding, changing and removing the attribute.
 *
 * @param {Object} styles An object containing available styles. See {@link module:image/imagestyle/imagestyleengine~ImageStyleFormat}
 * for more details.
 * @returns {Function} A model-to-view attribute converter.
 */
export function modelToViewStyleAttribute( styles ) {
	return ( evt, data, consumable, conversionApi ) => {
		const eventType = evt.name.split( ':' )[ 0 ];
		const consumableType = eventType + ':imageStyle';

		if ( !consumable.test( data.item, consumableType ) ) {
			return;
		}

		// Check if there is class name associated with given value.
		const newStyle = getStyleByName( data.attributeNewValue, styles );
		const oldStyle = getStyleByName( data.attributeOldValue, styles );
		const viewElement = conversionApi.mapper.toViewElement( data.item );

		const isRemovalHandled = handleRemoval( eventType, oldStyle, viewElement );
		const isAdditionHandled = handleAddition( eventType, newStyle, viewElement );

		// https://github.com/ckeditor/ckeditor5-image/issues/132
		if ( isRemovalHandled || isAdditionHandled ) {
			consumable.consume( data.item, consumableType );
		}
	};
}

/**
 * Returns a view-to-model converter converting image CSS classes to a proper value in the model.
 *
 * @param {Array.<module:image/imagestyle/imagestyleengine~ImageStyleFormat>} styles Styles for which the converter is created.
 * @returns {Function} A view-to-model converter.
 */
export function viewToModelStyleAttribute( styles ) {
	// Convert only non–default styles.
	const filteredStyles = styles.filter( style => !style.isDefault );

	return ( evt, data, consumable, conversionApi ) => {
		for ( const style of filteredStyles ) {
			viewToModelImageStyle( style, data, consumable, conversionApi );
		}
	};
}

// Converter from view to model converting single style.
// For more information see {@link module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher};
//
// @param {module:image/imagestyle/imagestyleengine~ImageStyleFormat} style
// @param {Object} data
// @param {module:engine/conversion/viewconsumable~ViewConsumable} consumable
// @param {Object} conversionApi
function viewToModelImageStyle( style, data, consumable, conversionApi ) {
	const viewFigureElement = data.input;
	const modelImageElement = data.output;

	// *** Step 1: Validate conversion.
	// Check if view element has proper class to consume.
	if ( !consumable.test( viewFigureElement, { class: style.className } ) ) {
		return;
	}

	// Check if figure is converted to image.
	if ( !isImage( modelImageElement ) ) {
		return;
	}

	// Check if image element can be placed in current context wit additional attribute.
	const attributes = [ ...modelImageElement.getAttributeKeys(), 'imageStyle' ];

	if ( !conversionApi.schema.check( { name: 'image', inside: data.context, attributes } ) ) {
		return;
	}

	// *** Step2: Convert to model.
	consumable.consume( viewFigureElement, { class: style.className } );
	modelImageElement.setAttribute( 'imageStyle', style.name );
}

// Returns style with given `name` from array of styles.
//
// @param {String} name
// @param {Array.<module:image/imagestyle/imagestyleengine~ImageStyleFormat> } styles
// @return {module:image/imagestyle/imagestyleengine~ImageStyleFormat|undefined}
function getStyleByName( name, styles ) {
	for ( const style of styles ) {
		if ( style.name === name ) {
			return style;
		}
	}
}

// Handles converting removal of the attribute.
// Returns `true` when handling was processed correctly and further conversion can be performed.
//
// @param {String} eventType Type of the event.
// @param {module:image/imagestyle/imagestyleengine~ImageStyleFormat} style
// @param {module:engine/view/element~Element} viewElement
// @returns {Boolean} Whether the change was handled.
function handleRemoval( eventType, style, viewElement ) {
	if ( style && ( eventType == 'changeAttribute' || eventType == 'removeAttribute' ) ) {
		viewElement.removeClass( style.className );

		return true;
	}

	return false;
}

// Handles converting addition of the attribute.
// Returns `true` when handling was processed correctly and further conversion can be performed.
//
// @param {String} eventType Type of the event.
// @param {module:image/imagestyle/imagestyleengine~ImageStyleFormat} style
// @param {module:engine/view/element~Element} viewElement
// @returns {Boolean} Whether the change was handled.
function handleAddition( evenType, style, viewElement ) {
	if ( style && ( evenType == 'addAttribute' || evenType == 'changeAttribute' ) ) {
		viewElement.addClass( style.className );

		return true;
	}

	return false;
}
