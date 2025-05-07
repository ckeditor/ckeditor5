/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listproperties/liststartcommand
 */

import { Command } from 'ckeditor5/src/core.js';
import { first } from 'ckeditor5/src/utils.js';
import {
	expandListBlocksToCompleteList,
	isListItemBlock,
	isNumberedListType
} from '../list/utils/model.js';

/**
 * The list start index command. It changes the `listStart` attribute of the selected list items,
 * letting the user to choose the starting point of an ordered list.
 * It is used by the {@link module:list/listproperties~ListProperties list properties feature}.
 */
export default class ListStartCommand extends Command {
	/**
	 * @inheritDoc
	 */
	declare public value: number | null;

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
	 * @param options Execute options.
	 * @param options.startIndex The list start index.
	 */
	public override execute( { startIndex = 1 }: { startIndex?: number } = {} ): void {
		const model = this.editor.model;
		const document = model.document;

		let blocks = Array.from( document.selection.getSelectedBlocks() )
			.filter( block =>
				isListItemBlock( block ) &&
				isNumberedListType( block.getAttribute( 'listType' ) )
			);

		blocks = expandListBlocksToCompleteList( blocks );

		model.change( writer => {
			for ( const block of blocks ) {
				writer.setAttribute( 'listStart', startIndex >= 0 ? startIndex : 1, block );
			}
		} );
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @returns The current value.
	 */
	private _getValue() {
		const model = this.editor.model;
		const document = model.document;

		const block = first( document.selection.getSelectedBlocks() );

		if (
			block &&
			isListItemBlock( block ) &&
			isNumberedListType( block.getAttribute( 'listType' ) )
		) {
			return block.getAttribute( 'listStart' ) as number;
		}

		return null;
	}
}
