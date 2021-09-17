/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { first } from 'ckeditor5/src/utils';

/**
 * @module image/imagestyle/converters
 */

/**
 * Returns a converter for the `imageStyle` attribute. It can be used for adding, changing and removing the attribute.
 *
 * @param {Array.<module:image/imagestyle~ImageStyleOptionDefinition>} styles
 * An array containing available image style options.
 * @returns {Function} A model-to-view attribute converter.
 */
export function modelToViewStyleAttribute( styles ) {
	return ( evt, data, conversionApi ) => {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		// Check if there is class name associated with given value.
		const newStyle = getStyleDefinitionByName( data.attributeNewValue, styles );
		const oldStyle = getStyleDefinitionByName( data.attributeOldValue, styles );

		const viewElement = conversionApi.mapper.toViewElement( data.item );
		const viewWriter = conversionApi.writer;

		if ( oldStyle ) {
			viewWriter.removeClass( oldStyle.className, viewElement );
		}

		if ( newStyle ) {
			viewWriter.addClass( newStyle.className, viewElement );
		}
	};
}

/**
 * Returns a view-to-model converter converting image CSS classes to a proper value in the model.
 *
 * @param {Array.<module:image/imagestyle~ImageStyleOptionDefinition>} styles
 * Image style options for which the converter is created.
 * @returns {Function} A view-to-model converter.
 */
export function viewToModelStyleAttribute( styles ) {
	// Convert only non–default styles.
	const nonDefaultStyles = {
		imageInline: styles.filter( style => !style.isDefault && style.modelElements.includes( 'imageInline' ) ),
		imageBlock: styles.filter( style => !style.isDefault && style.modelElements.includes( 'imageBlock' ) )
	};

	return ( evt, data, conversionApi ) => {
		if ( !data.modelRange ) {
			return;
		}

		const viewElement = data.viewItem;
		const modelImageElement = first( data.modelRange.getItems() );

		// Run this converter only if an image has been found in the model.
		// In some cases it may not be found (for example if we run this on a figure with different type than image).
		if ( !modelImageElement ) {
			return;
		}

		// ...and the `imageStyle` attribute is allowed for that element, otherwise stop conversion early.
		if ( !conversionApi.schema.checkAttribute( modelImageElement, 'imageStyle' ) ) {
			return;
		}

		// Convert styles one by one.
		for ( const style of nonDefaultStyles[ modelImageElement.name ] ) {
			// Try to consume class corresponding with the style.
			if ( conversionApi.consumable.consume( viewElement, { classes: style.className } ) ) {
				// And convert this style to model attribute.
				conversionApi.writer.setAttribute( 'imageStyle', style.name, modelImageElement );
			}
		}
	};
}

// Returns the style with a given `name` from an array of styles.
//
// @param {String} name
// @param {Array.<module:image/imagestyle~ImageStyleOptionDefinition> } styles
// @returns {module:image/imagestyle~ImageStyleOptionDefinition|undefined}
function getStyleDefinitionByName( name, styles ) {
	for ( const style of styles ) {
		if ( style.name === name ) {
			return style;
		}
	}
}
