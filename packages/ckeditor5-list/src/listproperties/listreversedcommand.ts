/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/listproperties/listreversedcommand
 */

import { Command } from 'ckeditor5/src/core';
import { getSelectedListItems } from '../list/utils';

/**
 * The reversed list command. It changes the `listReversed` attribute of the selected list items. As a result, the list order will be
 * reversed.
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
		const listItems = getSelectedListItems( model )
			.filter( item => item.getAttribute( 'listType' ) == 'numbered' );

		model.change( writer => {
			for ( const item of listItems ) {
				writer.setAttribute( 'listReversed', !!options.reversed, item );
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
			return listItem.getAttribute( 'listReversed' ) as boolean;
		}

		return null;
	}
}
