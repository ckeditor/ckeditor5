/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module line-height/lineheightcommand
 */

import { Command } from 'ckeditor5/src/core.js';
import { LINE_HEIGHT } from './lineheightconfig.js';

/**
 * The line height command. It is used by the {@link module:line-height/lineheightediting~LineHeightEditing}
 * to apply the line height on block elements.
 */
export default class LineHeightCommand extends Command {
	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const document = model.document;

		this.value = document.selection.getAttribute( LINE_HEIGHT );

		console.log( 'this.value', this.value );

		// Get elements where the command applies. If there are no such
		// elements, disable the command.
		const blocks = Array.from( document.selection.getSelectedBlocks() );

		console.log( 'blocks', blocks );

		// this.isEnabled = blocks.every( block => block.hasAttribute( LINE_HEIGHT ) );

		if ( !blocks.length ) {
			this.isEnabled = false;
			return;
		}

		this.isEnabled = true;
	}

	/**
	 * Executes the command.
	 *
	 * @param options.value The value to apply. When `undefined`, the command will remove the attribute.
	 */
	public override execute( options: { value?: number } = {} ): void {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;

		const value = options.value;

		model.change( writer => {
			// Get blocks where selection starts and ends
			const blocks = Array.from( selection.getSelectedBlocks() );

			// Apply or remove the line height to/from selected blocks
			for ( const block of blocks ) {
				if ( value ) {
					writer.setAttribute( LINE_HEIGHT, value, block );
				} else {
					writer.removeAttribute( LINE_HEIGHT, block );
				}
			}
		} );
	}
}
