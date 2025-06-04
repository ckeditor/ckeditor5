/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module line-height/lineheightcommand
 */

import { Command } from 'ckeditor5/src/core.js';
import { LINE_HEIGHT } from './lineheightconfig.js';
import { first } from 'ckeditor5/src/utils.js';
import type { Element } from 'ckeditor5/src/engine.js';

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
		const firstBlock = first( document.selection.getSelectedBlocks() )!;

		this.isEnabled = Boolean( firstBlock ) && this._canBeAligned( firstBlock );
		this.value = this.isEnabled && firstBlock.getAttribute( LINE_HEIGHT );
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
			// Get blocks where selection starts and ends.
			const blocks = Array.from( selection.getSelectedBlocks() );

			// Apply or remove the line height to/from selected blocks.
			for ( const block of blocks ) {
				if ( value ) {
					writer.setAttribute( LINE_HEIGHT, value, block );
				} else {
					writer.removeAttribute( LINE_HEIGHT, block );
				}
			}
		} );
	}

	/**
	 * Checks whether a block can have the `lineHeight` attribute set.
	 */
	private _canBeAligned( block: Element ) {
		return this.editor.model.schema.checkAttribute( block, LINE_HEIGHT );
	}
}
