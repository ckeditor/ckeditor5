/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module link/unlinkcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import findLinkRange from './findlinkrange';

/**
 * The unlink command. It is used by the {@link module:link/link~Link link plugin}.
 *
 * @extends module:core/command~Command
 */
export default class UnlinkCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this.editor.document.selection.hasAttribute( 'linkHref' );
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is collapsed, removes the `linkHref` attribute from each node with the same `linkHref` attribute value.
	 * When the selection is non-collapsed, removes the `linkHref` attribute from each node in selected ranges.
	 *
	 * @fires execute
	 */
	execute() {
		const document = this.editor.document;
		const selection = document.selection;

		document.enqueueChanges( () => {
			// Get ranges to unlink.
			const rangesToUnlink = selection.isCollapsed ?
				[ findLinkRange( selection.getFirstPosition(), selection.getAttribute( 'linkHref' ) ) ] : selection.getRanges();

			// Keep it as one undo step.
			const batch = document.batch();

			// Remove `linkHref` attribute from specified ranges.
			for ( const range of rangesToUnlink ) {
				batch.removeAttribute( range, 'linkHref' );
			}
		} );
	}
}
