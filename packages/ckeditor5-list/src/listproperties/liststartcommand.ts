/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/listproperties/liststartcommand
 */

import { Command } from 'ckeditor5/src/core';
import { getSelectedListItems } from '../list/utils';

/**
 * The list start index command. It changes the `listStart` attribute of the selected list items.
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
	 * @param options.startIndex The list start index.
	 */
	public override execute( { startIndex = 1 }: { startIndex?: number } = {} ): void {
		const model = this.editor.model;
		const listItems = getSelectedListItems( model )
			.filter( item => item.getAttribute( 'listType' ) == 'numbered' );

		model.change( writer => {
			for ( const item of listItems ) {
				writer.setAttribute( 'listStart', startIndex >= 0 ? startIndex : 1, item );
			}
		} );
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @returns The current value.
	 */
	private _getValue() {
		const listItem = this.editor.model.document.selection.getFirstPosition()!.parent;

		if ( listItem && listItem.is( 'element', 'listItem' ) && listItem.getAttribute( 'listType' ) == 'numbered' ) {
			return listItem.getAttribute( 'listStart' ) as number;
		}

		return null;
	}
}
