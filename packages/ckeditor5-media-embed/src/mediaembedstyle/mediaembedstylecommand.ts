/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedstyle/mediaembedstylecommand
 */

import { Command } from '@ckeditor/ckeditor5-core';
import { getSelectedMediaModelWidget } from '../utils.js';
import { DEFAULT_STYLE_NAME, type MediaStyleName } from './constants.js';

/**
 * The media embed style command. It is used to apply an alignment style to a selected media embed.
 */
export class MediaEmbedStyleCommand extends Command {
	/**
	 * The current media style name, or `false` when the command is disabled (no media selected).
	 * Falls back to the default style name when the selected media has no `mediaStyle` attribute,
	 * so the default-state UI button can light up on insert.
	 */
	declare public value: string | false;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const element = getSelectedMediaModelWidget( this.editor.model.document.selection );

		this.isEnabled = !!element;

		if ( !element ) {
			this.value = false;
		} else if ( element.hasAttribute( 'mediaStyle' ) ) {
			this.value = element.getAttribute( 'mediaStyle' ) as MediaStyleName;
		} else {
			this.value = DEFAULT_STYLE_NAME;
		}
	}

	/**
	 * Executes the command and applies the alignment style to the currently selected media embed.
	 *
	 * ```ts
	 * editor.execute( 'mediaStyle', { value: 'alignLeft' } );
	 * editor.execute( 'mediaStyle', { value: 'alignCenter' } ); // removes the attribute
	 * editor.execute( 'mediaStyle', { value: null } );          // removes the attribute
	 * ```
	 *
	 * Only {@link module:media-embed/mediaembedstyle/constants~MediaStyleName} values are honored.
	 * The schema does not constrain the `mediaStyle` attribute, so passing an unknown string will
	 * still set the model attribute, but the downcast will silently drop it (no class is emitted).
	 *
	 * @param options
	 * @param options.value The name of the style to apply, or `null` to clear the alignment.
	 * Passing the default style name (`'alignCenter'`) also clears the attribute.
	 * @fires execute
	 */
	public override execute( options: { value: MediaStyleName | null } ): void {
		const model = this.editor.model;
		const element = getSelectedMediaModelWidget( model.document.selection );

		if ( element ) {
			const requestedStyle = options.value;

			model.change( writer => {
				// The default style is encoded as attribute-absence on the model.
				if ( !requestedStyle || requestedStyle === DEFAULT_STYLE_NAME ) {
					writer.removeAttribute( 'mediaStyle', element );
					return;
				}

				writer.setAttribute( 'mediaStyle', requestedStyle, element );
			} );
		}
	}
}
