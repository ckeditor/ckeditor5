/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listproperties/listreversedcommand
 */

import { Command } from 'ckeditor5/src/core.js';
import { first } from 'ckeditor5/src/utils.js';
import {
	expandListBlocksToCompleteList,
	isListItemBlock
} from '../list/utils/model.js';

/**
 * The list reversed command. It changes the `listReversed` attribute of the selected list items,
 * letting the user to choose the order of an ordered list.
 * It is used by the {@link module:list/listproperties~ListProperties list properties feature}.
 */
export default class ListReversedCommand extends Command {
	/**
	 * @inheritDoc
	 */
	declare public value: boolean | null;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const value = this._getValue();

		this.value = value;
		this.isEnabled = value != null;
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options.reversed Whether the list should be reversed.
	 */
	public override execute( options: { reversed?: boolean } = {} ): void {
		const model = this.editor.model;
		const document = model.document;

		let blocks = Array.from( document.selection.getSelectedBlocks() )
			.filter( block => isListItemBlock( block ) && block.getAttribute( 'listType' ) == 'numbered' );

		blocks = expandListBlocksToCompleteList( blocks );

		model.change( writer => {
			for ( const block of blocks ) {
				writer.setAttribute( 'listReversed', !!options.reversed, block );
			}
		} );
	}

	/**
	 * Checks the command's {@link #value}.
	 */
	private _getValue() {
		const model = this.editor.model;
		const document = model.document;

		const block = first( document.selection.getSelectedBlocks() );

		if ( isListItemBlock( block ) && block.getAttribute( 'listType' ) == 'numbered' ) {
			return block.getAttribute( 'listReversed' ) as boolean;
		}

		return null;
	}
}
