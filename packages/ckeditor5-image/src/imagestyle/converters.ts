/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type { DowncastAttributeEvent, Element, UpcastElementEvent } from 'ckeditor5/src/engine.js';
import { first, type GetCallback } from 'ckeditor5/src/utils.js';
import type { ImageStyleOptionDefinition } from '../imageconfig.js';

/**
 * @module image/imagestyle/converters
 */

/**
 * Returns a converter for the `imageStyle` attribute. It can be used for adding, changing and removing the attribute.
 *
 * @param styles An array containing available image style options.
 * @returns A model-to-view attribute converter.
 */
export function modelToViewStyleAttribute( styles: Array<ImageStyleOptionDefinition> ): GetCallback<DowncastAttributeEvent> {
	return ( evt, data, conversionApi ) => {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		// Check if there is class name associated with given value.
		const newStyle = getStyleDefinitionByName( data.attributeNewValue as string, styles );
		const oldStyle = getStyleDefinitionByName( data.attributeOldValue as string, styles );

		const viewElement = conversionApi.mapper.toViewElement( data.item as Element )!;
		const viewWriter = conversionApi.writer;

		if ( oldStyle ) {
			viewWriter.removeClass( oldStyle.className!, viewElement );
		}

		if ( newStyle ) {
			viewWriter.addClass( newStyle.className!, viewElement );
		}
	};
}

/**
 * Returns a view-to-model converter converting image CSS classes to a proper value in the model.
 *
 * @param styles Image style options for which the converter is created.
 * @returns A view-to-model converter.
 */
export function viewToModelStyleAttribute( styles: Array<ImageStyleOptionDefinition> ): GetCallback<UpcastElementEvent> {
	// Convert only non–default styles.
	const nonDefaultStyles: Record<string, Array<ImageStyleOptionDefinition>> = {
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
		for ( const style of nonDefaultStyles[ ( modelImageElement as Element ).name ] ) {
			// Try to consume class corresponding with the style.
			if ( conversionApi.consumable.consume( viewElement, { classes: style.className } ) ) {
				// And convert this style to model attribute.
				conversionApi.writer.setAttribute( 'imageStyle', style.name, modelImageElement );
			}
		}
	};
}

/**
 * Returns the style with a given `name` from an array of styles.
 */
function getStyleDefinitionByName( name: string, styles: Array<ImageStyleOptionDefinition> ): ImageStyleOptionDefinition | undefined {
	for ( const style of styles ) {
		if ( style.name === name ) {
			return style;
		}
	}
}
