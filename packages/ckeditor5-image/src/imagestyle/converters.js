/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
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
		if ( !consumable.consume( data.item, evt.name ) ) {
			return;
		}

		// Check if there is class name associated with given value.
		const newStyle = getStyleByName( data.attributeNewValue, styles );
		const oldStyle = getStyleByName( data.attributeOldValue, styles );

		const viewElement = conversionApi.mapper.toViewElement( data.item );

		if ( oldStyle ) {
			viewElement.removeClass( oldStyle.className );
		}

		if ( newStyle ) {
			viewElement.addClass( newStyle.className );
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

	if ( !conversionApi.schema.checkAttribute( [ ...data.context, 'image' ], 'imageStyle' ) ) {
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
