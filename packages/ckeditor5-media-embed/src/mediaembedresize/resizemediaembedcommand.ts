/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedresize/resizemediaembedcommand
 */

import { Command } from '@ckeditor/ckeditor5-core';
import { getSelectedMediaModelWidget } from '../utils.js';

/**
 * The resize media embed command.
 */
export class ResizeMediaEmbedCommand extends Command {
	/**
	 * The current width of the selected media embed, or `null` if not resized.
	 */
	declare public value: string | null;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const element = getSelectedMediaModelWidget( this.editor.model.document.selection );

		this.isEnabled = !!element;
		this.value = element?.getAttribute( 'resizedWidth' ) as string || null;
	}

	/**
	 * Executes the command.
	 *
	 * ```ts
	 * // Sets the width to 50%:
	 * editor.execute( 'resizeMediaEmbed', { width: '50%' } );
	 *
	 * // Removes the width attribute:
	 * editor.execute( 'resizeMediaEmbed', { width: null } );
	 * ```
	 *
	 * @param options
	 * @param options.width The new width of the media embed.
	 * @fires execute
	 */
	public override execute( options: { width: string | null } ): void {
		const model = this.editor.model;
		const mediaElement = getSelectedMediaModelWidget( model.document.selection );

		if ( mediaElement ) {
			model.change( writer => {
				if ( options.width ) {
					writer.setAttribute( 'resizedWidth', options.width, mediaElement );
				} else {
					writer.removeAttribute( 'resizedWidth', mediaElement );
				}
			} );
		}
	}
}
