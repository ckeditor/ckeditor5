/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '../core/command/command.js';
import Range from '../engine/model/range.js';

/**
 * The unlink command. It is used by the {@link Link.Link link feature}.
 *
 * @memberOf link
 * @extends core.command.Command
 */
export default class LinkCommand extends Command {
	/**
	 * Executes the command.
	 *
	 * When selection is collapsed then whole link will be unlinked. {@link engine.model.TreeWalker TreeWalker} is
	 * looking for link bounds going forward and backward from the caret position.
	 *
	 * If selection is non-collapsed then only selected range will be unlinked.
	 *
	 * @protected
	 */
	_doExecute() {
		const document = this.editor.document;
		const selection = document.selection;
		const ranges = selection.getRanges();
		let rangesToUpdate = [];

		document.enqueueChanges( () => {
			// When selection is collapsed we have to find link bounds.
			if ( selection.isCollapsed ) {
				// Loop through each selection.
				for ( let range of ranges ) {
					// Get searching area.
					const parentNodeRange = Range.createIn( range.start.parent );

					// Create walker instances for going forward and backward.
					const walker = parentNodeRange.getWalker( { startPosition: range.start } );
					const backwardWalker = parentNodeRange.getWalker( { startPosition: range.start, direction: 'backward' } );

					// Store current link attribute value.
					const attributeValue = selection.getAttribute( 'link' );

					// Search link bounds and store found range.
					rangesToUpdate.push(
						new Range( getLinkBound( backwardWalker, attributeValue ), getLinkBound( walker, attributeValue ) )
					);
				}
			} else {
				// When selection is non-collapsed then we are unlinking selected ranges.
				rangesToUpdate = ranges;
			}

			// Keep it as one undo step.
			const batch = document.batch();

			// Remove attribute from each range.
			for ( let range of rangesToUpdate ) {
				batch.removeAttribute( range, 'link' );
			}

			// Remove attribute from selection.
			selection.removeAttribute( 'link' );
		} );
	}
}

// Walk trough the range and search for link bound.
//
// @param {engine.model.TreeWalker} walker TreeWalker instance.
// @param {String} linkValue Value of searching link.
// @returns {engine.model.Position} Position of link bound.
function getLinkBound( walker, linkValue ) {
	let lastPosition = walker.position;
	let current = walker.next();

	while ( !current.done ) {
		if ( current.value.item.getAttribute( 'link' ) != linkValue ) {
			return lastPosition;
		}

		lastPosition = walker.position;
		current = walker.next();
	}

	return lastPosition;
}
