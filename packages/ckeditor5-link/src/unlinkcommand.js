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

		document.enqueueChanges( () => {
			// Keep it as one undo step.
			const batch = document.batch();

			// When selection is collapsed we have to remove link attribute from every stick sibling with the same attribute value.
			if ( selection.isCollapsed ) {
				const linkValue = selection.getAttribute( 'link' );
				const position = selection.getFirstPosition();
				let sibling;

				// Get node on the right side of the selection. When selection is inside TextNode then get this node.
				sibling = position.textNode === null ? position.nodeAfter : position.textNode;

				// Walk forward and remove link attribute from each stick element with the same attribute value.
				while ( sibling ) {
					if ( sibling.getAttribute( 'link' ) == linkValue ) {
						batch.removeAttribute( sibling, 'link' );
						sibling = sibling.nextSibling;
					} else {
						sibling = null;
					}
				}

				// Get node on the left side of the selection. When selection is inside TextNode then get node just after
				// TextNode because link attribute has been already removed from TextNode during forward walking.
				sibling = position.textNode === null ? position.nodeBefore : position.textNode.previousSibling;

				// Walk backward and remove link attribute from each stick element with the same attribute value.
				while ( sibling ) {
					if ( sibling.getAttribute( 'link' ) == linkValue ) {
						batch.removeAttribute( sibling, 'link' );
						sibling = sibling.previousSibling;
					} else {
						sibling = null;
					}
				}
			} else {
				// When selection is non-collapsed then we are unlinking selected ranges.
				for ( let range of selection.getRanges() ) {
					batch.removeAttribute( range, 'link' );
				}
			}
		} );
	}
}
