/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import TreeWalker from '../../../engine/model/treewalker.js';

/**
 * Checks {@link engine.model.Document#schema} if attribute is allowed in selection:
 * * if selection is on range, the command is enabled if any of nodes in that range can have bold,
 * * if selection is collapsed, the command is enabled if text with bold is allowed in that node.
 *
 * @param {String} attribute Attribute key.
 * @param {engine.model.Selection} selection Selection which ranges will be validate.
 * @param {engine.model.Schema} schema Document schema.
 * @returns {Boolean}
 */
export default function isAttributeAllowedInSelection( attribute, selection, schema ) {
	if ( selection.isCollapsed ) {
		// Check whether schema allows for a test with `attributeKey` in caret position.
		return schema.check( { name: '$text', inside: selection.getFirstPosition(), attributes: attribute } );
	} else {
		const ranges = selection.getRanges();

		// For all ranges, check nodes in them until you find a node that is allowed to have `attributeKey` attribute.
		for ( let range of ranges ) {
			const walker = new TreeWalker( { boundaries: range, mergeCharacters: true } );
			let last = walker.position;
			let step = walker.next();

			// Walk the range.
			while ( !step.done ) {
				// If returned item does not have name property, it is a model.TextFragment.
				const name = step.value.item.name || '$text';

				if ( schema.check( { name: name, inside: last, attributes: attribute } ) ) {
					// If we found a node that is allowed to have the attribute, return true.
					return true;
				}

				last = walker.position;
				step = walker.next();
			}
		}
	}

	// If we haven't found such node, return false.
	return false;
}
