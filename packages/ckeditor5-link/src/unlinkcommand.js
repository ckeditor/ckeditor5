/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/unlinkcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { findElementRange } from '@ckeditor/ckeditor5-engine/src/utils/inlinehighlight';

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
		this.isEnabled = this.editor.model.document.selection.hasAttribute( 'linkHref' );
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is collapsed, it removes the `linkHref` attribute from each node with the same `linkHref` attribute value.
	 * When the selection is non-collapsed, it removes the `linkHref` attribute from each node in selected ranges.
	 *
	 * # Decorators
	 *
	 * If {@link module:link/link~LinkConfig#decorators `config.link.decorators`} is specified,
	 * all configured decorators are removed together with the `linkHref` attribute.
	 *
	 * @fires execute
	 */
	execute() {
		const editor = this.editor;
		const model = this.editor.model;
		const selection = model.document.selection;
		const linkCommand = editor.commands.get( 'link' );

		model.change( writer => {
			// Get ranges to unlink.
			const rangesToUnlink = selection.isCollapsed ?
				[ findElementRange(
					selection.getFirstPosition(),
					'linkHref',
					selection.getAttribute( 'linkHref' ),
					model
				) ] :
				selection.getRanges();

			// Remove `linkHref` attribute from specified ranges.
			for ( const range of rangesToUnlink ) {
				writer.removeAttribute( 'linkHref', range );
				// If there are registered custom attributes, then remove them during unlink.
				if ( linkCommand ) {
					for ( const manualDecorator of linkCommand.manualDecorators ) {
						writer.removeAttribute( manualDecorator.id, range );
					}
				}
			}
		} );
	}
}
