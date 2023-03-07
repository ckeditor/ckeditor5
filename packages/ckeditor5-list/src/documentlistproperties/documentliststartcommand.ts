/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlistproperties/documentliststartcommand
 */

import { Command } from 'ckeditor5/src/core';
import { first } from 'ckeditor5/src/utils';
import {
	expandListBlocksToCompleteList,
	isListItemBlock
} from '../documentlist/utils/model';

/**
 * The list start index command. It changes the `listStart` attribute of the selected list items,
 * letting the user to choose the starting point of an ordered list.
 * It is used by the {@link module:list/documentlistproperties~DocumentListProperties list properties feature}.
 */
export default class DocumentListStartCommand extends Command {
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
	 * @param options.startIndex The list start index.
	 */
	public override execute( { startIndex = 1 }: { startIndex?: number } = {} ): void {
		const model = this.editor.model;
		const document = model.document;

		let blocks = Array.from( document.selection.getSelectedBlocks() )
			.filter( block => isListItemBlock( block ) && block.getAttribute( 'listType' ) == 'numbered' );

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

		if ( block && isListItemBlock( block ) && block.getAttribute( 'listType' ) == 'numbered' ) {
			return block.getAttribute( 'listStart' ) as number;
		}

		return null;
	}
}
