/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/converters
 */

import { isImage, getStyleByValue } from './utils.js';

export function addStyle( styles ) {
	return ( event, data, consumable, conversionApi ) => {
		// Check if we can consume, and we are adding in image.
		if ( !consumable.test( data.item, 'addAttribute:imageStyle' ) || !isImage( data.item ) ) {
			return;
		}

		// Check if there is class name associated with given value.
		const newStyle = getStyleByValue( data.attributeNewValue, styles );

		// Check if new style is allowed in configuration.
		if ( !newStyle ) {
			return;
		}

		consumable.consume( data.item, 'addAttribute:imageStyle' );
		conversionApi.mapper.toViewElement( data.item ).addClass( newStyle.className );
	};
}

export function changeStyle( styles ) {
	return ( event, data, consumable, conversionApi ) => {
		if ( !consumable.test( data.item, 'changeAttribute:imageStyle' ) || !isImage( data.item ) ) {
			return;
		}

		// Check if there is class name associated with given value.
		const newStyle = getStyleByValue( data.attributeNewValue, styles );
		const oldStyle = getStyleByValue( data.attributeOldValue, styles );

		// Check if new style is allowed in configuration.
		if ( !newStyle || !oldStyle ) {
			return;
		}

		consumable.consume( data.item, 'changeAttribute:imageStyle' );
		const viewElement = conversionApi.mapper.toViewElement( data.item );
		viewElement.removeClass( data.attributeOldValue );
		viewElement.addClass( newStyle.className );
	};
}

export function removeStyle( styles ) {
	return ( event, data, consumable, conversionApi ) => {
		if ( !consumable.test( data.item, 'removeAttribute:imageStyle' ) || !isImage( data.item ) ) {
			return;
		}

		// Check if there is class name associated with given value.
		const newStyle = getStyleByValue( data.attributeNewValue, styles );
		const oldStyle = getStyleByValue( data.attributeOldValue, styles );

		// Check if styles are allowed in configuration.
		if ( !newStyle || !oldStyle ) {
			return;
		}

		consumable.consume( data.item, 'removeAttribute:imageStyle' );

		const viewElement = conversionApi.mapper.toViewElement( data.item );
		viewElement.removeClass( oldStyle.className );
	};
}

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
