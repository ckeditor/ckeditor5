/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '../core/command/command.js';

/**
 * The unlink command. It is used by the {@link Link.Link link feature}.
 *
 * @memberOf link
 * @extends core.command.Command
 */
export default class UnlinkCommand extends Command {
	/**
	 * Executes the command.
	 *
	 * When selection is collapsed then walk through each stick node with `linkHref` attribute and remove this attribute.
	 *
	 * If selection is non-collapsed then remove `linkHref` from each node in selected range.
	 *
	 * @protected
	 */
	_doExecute() {
		const document = this.editor.document;
		const selection = document.selection;

		document.enqueueChanges( () => {
			// Keep it as one undo step.
			const batch = document.batch();

			// When selection is collapsed we are removing `linkHref` attribute from every stick sibling with the same attribute value.
			if ( selection.isCollapsed ) {
				const linkValue = selection.getAttribute( 'linkHref' );
				const position = selection.getFirstPosition();
				let sibling;

				// Get node on the right side of the selection. When selection is inside TextNode then get this node.
				sibling = position.textNode === null ? position.nodeAfter : position.textNode;

				// Walk forward and remove `linkHref` attribute from each stick element with the same attribute value.
				while ( sibling ) {
					if ( sibling.getAttribute( 'linkHref' ) == linkValue ) {
						batch.removeAttribute( sibling, 'linkHref' );
						sibling = sibling.nextSibling;
					} else {
						sibling = null;
					}
				}

				// Get node on the left side of the selection. When selection is inside TextNode then get node just after
				// TextNode because `linkHref` attribute has been already removed from TextNode during forward walking.
				sibling = position.textNode === null ? position.nodeBefore : position.textNode.previousSibling;

				// Walk backward and remove `linkHref` attribute from each stick element with the same attribute value.
				while ( sibling ) {
					if ( sibling.getAttribute( 'linkHref' ) == linkValue ) {
						batch.removeAttribute( sibling, 'linkHref' );
						sibling = sibling.previousSibling;
					} else {
						sibling = null;
					}
				}
			} else {
				// When selection is non-collapsed then we are removing `linkHref` attribute from each node inside the ranges.
				for ( let range of selection.getRanges() ) {
					batch.removeAttribute( range, 'linkHref' );
				}
			}
		} );
	}
}
