/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/converters
 */

import { isImage, getStyleByValue } from './utils.js';

/**
 * Returns converter for `imageStyle` attribute. It can be used for adding, changing and removing the attribute.
 *
 * @param {Object} styles Object containing available styles. See {@link module:image/imagestyle/imagestyleengine~ImageStyleFormat}
 * for more details.
 * @returns {Function} Model to view attribute converter.
 */
export function modelToViewSetStyle( styles ) {
	return ( evt, data, consumable, conversionApi ) => {
		const eventType = evt.name.split( ':' )[ 0 ];
		const consumableType = eventType + ':imageStyle';

		if ( !consumable.test( data.item, consumableType ) ) {
			return;
		}

		// Check if there is class name associated with given value.
		const newStyle = getStyleByValue( data.attributeNewValue, styles );
		const oldStyle = getStyleByValue( data.attributeOldValue, styles );
		const viewElement = conversionApi.mapper.toViewElement( data.item );

		if ( eventType == 'addAttribute' || eventType == 'changeAttribute' ) {
			if ( !newStyle ) {
				return;
			}

			viewElement.addClass( newStyle.className );
		}

		if ( eventType == 'changeAttribute' || eventType == 'removeAttribute' ) {
			if ( !oldStyle ) {
				return;
			}

			viewElement.removeClass( data.attributeOldValue );
		}

		consumable.consume( data.item, consumableType );
	};
}

/**
 * Returns view to model converter converting image style CSS class to proper value in the model.
 *
 * @param {module:image/imagestyle/imagestyleengine~ImageStyleFormat} style Style for which converter is created.
 * @returns {Function} View to model converter.
 */
export function viewToModelImageStyle( style ) {
	return ( evt, data, consumable, conversionApi ) => {
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
		modelImageElement.setAttribute( 'imageStyle', style.value );
	};
}
