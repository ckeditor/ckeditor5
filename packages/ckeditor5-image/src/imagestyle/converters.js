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
 * @param {Array.<module:image/imagestyle~ImageStyleArrangementDefinition>} arrangements
 * An array containing available arrangements.
 * @returns {Function} A model-to-view attribute converter.
 */
export function modelToViewStyleAttribute( arrangements ) {
	return ( evt, data, conversionApi ) => {
		if ( !conversionApi.consumable.consume( data.item, evt.name ) ) {
			return;
		}

		// Check if there is class name associated with given value.
		const newStyle = getArrangementDefinitionByName( data.attributeNewValue, arrangements );
		const oldStyle = getArrangementDefinitionByName( data.attributeOldValue, arrangements );

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
 * @param {Array.<module:image/imagestyle~ImageStyleArrangementDefinition>} arrangements
 * Arrangements for which the converter is created.
 * @returns {Function} A view-to-model converter.
 */
export function viewToModelStyleAttribute( arrangements ) {
	// Convert only non–default arrangements.
	const nonDefaultArrangements = {
		imageInline: arrangements.filter( arrangement => !arrangement.isDefault && arrangement.modelElements.includes( 'imageInline' ) ),
		image: arrangements.filter( arrangement => !arrangement.isDefault && arrangement.modelElements.includes( 'image' ) )
	};

	return ( evt, data, conversionApi ) => {
		if ( !data.modelRange ) {
			return;
		}

		const viewElement = data.viewItem;
		const modelImageElement = first( data.modelRange.getItems() );

		// Check if `modelImageElement` exists (see: https://github.com/ckeditor/ckeditor5/issues/8270)
		// and `imageStyle` attribute is allowed for that element, otherwise stop conversion early.
		if ( modelImageElement && !conversionApi.schema.checkAttribute( modelImageElement, 'imageStyle' ) ) {
			return;
		}

		// Convert arrangements one by one.
		for ( const arrangement of nonDefaultArrangements[ modelImageElement.name ] ) {
			// Try to consume class corresponding with arrangement.
			if ( conversionApi.consumable.consume( viewElement, { classes: arrangement.className } ) ) {
				// And convert this arrangement to model attribute.
				conversionApi.writer.setAttribute( 'imageStyle', arrangement.name, modelImageElement );
			}
		}
	};
}

// Returns the style with a given `name` from an array of arrangements.
//
// @param {String} name
// @param {Array.<module:image/imagestyle~ImageStyleArrangementDefinition> } styles
// @returns {module:image/imagestyle~ImageStyleArrangementDefinition|undefined}
function getArrangementDefinitionByName( name, styles ) {
	for ( const style of styles ) {
		if ( style.name === name ) {
			return style;
		}
	}
}
