/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ModelDocumentFragment from '../model/documentfragment';
import ModelText from '../model/text';
import { normalizeNodes } from '../model/writer';

/**
 * Contains {@link module:engine/view/view view} to {@link module:engine/model/model model} converters for
 * {@link module:engine/conversion/viewconversiondispatcher~ViewConversionDispatcher}.
 *
 * @module engine/conversion/view-to-model-converters
 */

/**
 * Function factory, creates a converter that converts {@link module:engine/view/documentfragment~DocumentFragment view document fragment}
 * or all children of {@link module:engine/view/element~Element} into
 * {@link module:engine/model/documentfragment~DocumentFragment model document fragment}.
 * This is the "entry-point" converter for view to model conversion. This converter starts the conversion of all children
 * of passed view document fragment. Those children {@link module:engine/view/node~Node view nodes} are then handled by other converters.
 *
 * This also a "default", last resort converter for all view elements that has not been converted by other converters.
 * When a view element is being converted to the model but it does not have converter specified, that view element
 * will be converted to {@link module:engine/model/documentfragment~DocumentFragment model document fragment} and returned.
 *
 * @returns {Function} Universal converter for view {@link module:engine/view/documentfragment~DocumentFragment fragments} and
 * {@link module:engine/view/element~Element elements} that returns
 * {@link module:engine/model/documentfragment~DocumentFragment model fragment} with children of converted view item.
 */
export function convertToModelFragment() {
	return ( evt, data, consumable, conversionApi ) => {
		// Second argument in `consumable.consume` is discarded for ViewDocumentFragment but is needed for ViewElement.
		if ( !data.output && consumable.consume( data.input, { name: true } ) ) {
			const convertedChildren = conversionApi.convertChildren( data.input, consumable, data );

			data.output = new ModelDocumentFragment( normalizeNodes( convertedChildren ) );
		}
	};
}

/**
 * Function factory, creates a converter that converts {@link module:engine/view/text~Text} to {@link module:engine/model/text~Text}.
 *
 * @returns {Function} {@link module:engine/view/text~Text View text} converter.
 */
export function convertText() {
	return ( evt, data, consumable, conversionApi ) => {
		const schemaQuery = {
			name: '$text',
			inside: data.context
		};

		if ( conversionApi.schema.check( schemaQuery ) ) {
			if ( consumable.consume( data.input ) ) {
				data.output = new ModelText( data.input.data );
			}
		}
	};
}
