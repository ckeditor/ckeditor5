/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import ModelDocumentFragment from '../treemodel/documentfragment.js';
import ModelText from '../treemodel/text.js';

/**
 * Contains {@link engine.treeView view} to {@link engine.treeModel model} converters for
 * {@link engine.treeController.ViewConversionDispatcher}.
 *
 * @namespace engine.treeController.viewToModel
 */

/**
 * Function factory, creates a converter that converts {@link engine.treeView.DocumentFragment view document fragment} or
 * all children of {@link engine.treeView.Element} into {@link engine.treeModel.DocumentFragment model document fragment}.
 * This is the "entry-point" converter for view to model conversion. This converter starts the conversion of all "children"
 * of passed view document fragment. Those "children" {@link engine.treeView.Node view nodes} are then handled by other converters.
 *
 * This also a "default", last resort converter for all view elements that has not been converted by other converters.
 * When a view element is converted to the model and it does not have it's converter specified, all of that elements
 * children will be converted to {@link engine.treeModel.DocumentFragment} and returned.
 *
 * @external engine.treeController.viewToModel
 * @function engine.treeController.viewToModel.convertToModelFragment
 * @returns {Function} Universal converter for view {@link engine.treeView.DocumentFragment fragments} and
 * {@link engine.treeView.Element elements} that returns {@link engine.treeModel.DocumentFragment model fragment} with
 * children of converted view item.
 */
export function convertToModelFragment() {
	return ( evt, data, consumable, conversionApi ) => {
		if ( !data.output && consumable.test( data.input ) ) {
			const convertedChildren = conversionApi.convertChildren( data.input, consumable, { context: data.context } );

			data.output = new ModelDocumentFragment( convertedChildren );
		}
	};
}

/**
 * Function factory, creates a converter that converts {@link engine.treeView.Text} to {@link engine.treeModel.Text}.
 *
 * @external engine.treeController.viewToModel
 * @function engine.treeController.viewToModel.convertText
 * @returns {Function} {@link engine.treeView.Text View text} converter.
 */
export function convertText() {
	return ( evt, data, consumable ) => {
		if ( consumable.consume( data.input ) ) {
			data.output = new ModelText( data.input.data );
		}
	};
}
