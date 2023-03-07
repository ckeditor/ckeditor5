/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/unlinkcommand
 */

import { Command } from 'ckeditor5/src/core';
import { findAttributeRange } from 'ckeditor5/src/typing';

import type LinkCommand from './linkcommand';
import { isLinkableElement } from './utils';

/**
 * The unlink command. It is used by the {@link module:link/link~Link link plugin}.
 */
export default class UnlinkCommand extends Command {
	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const selection = model.document.selection;
		const selectedElement = selection.getSelectedElement();

		// A check for any integration that allows linking elements (e.g. `LinkImage`).
		// Currently the selection reads attributes from text nodes only. See #7429 and #7465.
		if ( isLinkableElement( selectedElement, model.schema ) ) {
			this.isEnabled = model.schema.checkAttribute( selectedElement, 'linkHref' );
		} else {
			this.isEnabled = model.schema.checkAttributeInSelection( selection, 'linkHref' );
		}
	}

	/**
	 * Executes the command.
	 *
	 * When the selection is collapsed, it removes the `linkHref` attribute from each node with the same `linkHref` attribute value.
	 * When the selection is non-collapsed, it removes the `linkHref` attribute from each node in selected ranges.
	 *
	 * # Decorators
	 *
	 * If {@link module:link/linkconfig~LinkConfig#decorators `config.link.decorators`} is specified,
	 * all configured decorators are removed together with the `linkHref` attribute.
	 *
	 * @fires execute
	 */
	public override execute(): void {
		const editor = this.editor;
		const model = this.editor.model;
		const selection = model.document.selection;
		const linkCommand: LinkCommand | undefined = editor.commands.get( 'link' );

		model.change( writer => {
			// Get ranges to unlink.
			const rangesToUnlink = selection.isCollapsed ?
				[ findAttributeRange(
					selection.getFirstPosition()!,
					'linkHref',
					selection.getAttribute( 'linkHref' ),
					model
				) ] :
				model.schema.getValidRanges( selection.getRanges(), 'linkHref' );

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
