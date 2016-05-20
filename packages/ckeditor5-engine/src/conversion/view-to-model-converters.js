/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ModelDocumentFragment from '../model/documentfragment.js';
import ModelText from '../model/text.js';

/**
 * Contains {@link engine.view view} to {@link engine.model model} converters for
 * {@link engine.conversion.ViewConversionDispatcher}.
 *
 * @namespace engine.conversion.viewToModel
 */

/**
 * Function factory, creates a converter that converts {@link engine.view.DocumentFragment view document fragment} or
 * all children of {@link engine.view.Element} into {@link engine.model.DocumentFragment model document fragment}.
 * This is the "entry-point" converter for view to model conversion. This converter starts the conversion of all "children"
 * of passed view document fragment. Those "children" {@link engine.view.Node view nodes} are then handled by other converters.
 *
 * This also a "default", last resort converter for all view elements that has not been converted by other converters.
 * When a view element is converted to the model and it does not have it's converter specified, all of that elements
 * children will be converted to {@link engine.model.DocumentFragment} and returned.
 *
 * @external engine.conversion.viewToModel
 * @function engine.conversion.viewToModel.convertToModelFragment
 * @returns {Function} Universal converter for view {@link engine.view.DocumentFragment fragments} and
 * {@link engine.view.Element elements} that returns {@link engine.model.DocumentFragment model fragment} with
 * children of converted view item.
 */
export function convertToModelFragment() {
	return ( evt, data, consumable, conversionApi ) => {
		// Second argument in `consumable.test` is discarded for ViewDocumentFragment but is needed for ViewElement.
		if ( !data.output && consumable.test( data.input, { name: true } ) ) {
			const convertedChildren = conversionApi.convertChildren( data.input, consumable, data );

			data.output = new ModelDocumentFragment( convertedChildren );
		}
	};
}

/**
 * Function factory, creates a converter that converts {@link engine.view.Text} to {@link engine.model.Text}.
 *
 * @external engine.conversion.viewToModel
 * @function engine.conversion.viewToModel.convertText
 * @returns {Function} {@link engine.view.Text View text} converter.
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
