/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlistproperties/documentlistreversedcommand
 */

import { Command } from 'ckeditor5/src/core';
import { expandListBlocksToCompleteItems, getListItems } from '../documentlist/utils/model';

/**
 * The list start index command. It changes the `listReversed` attribute of the selected list items,
 * letting the user to choose the order of an ordered list.
 * It is used by the {@link module:list/documentlistproperties~DocumentListProperties list properties feature}.
 *
 * @extends module:core/command~Command
 */
export default class DocumentListReversedCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const value = this._getValue();
		this.value = value;
		this.isEnabled = value != null;
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} [options]
	 * @param {Boolean} [options.reversed=false] Whether the list should be reversed.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		let blocks = Array.from( document.selection.getSelectedBlocks() )
			.filter( block => block.hasAttribute( 'listReversed' ) && block.getAttribute( 'listType' ) == 'numbered' );

		if ( document.selection.isCollapsed ) {
			const documentListEditingPlugin = this.editor.plugins.get( 'DocumentListEditing' );

			blocks = getListItems( blocks[ 0 ], documentListEditingPlugin.getSameListDefiningAttributes() );
		} else {
			blocks = expandListBlocksToCompleteItems( blocks, { withNested: false } );
		}

		model.change( writer => {
			for ( const block of blocks ) {
				writer.setAttribute( 'listReversed', !!options.reversed, block );
			}
		} );
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @private
	 * @returns {Boolean|null} The current value.
	 */
	_getValue() {
		const listItem = this.editor.model.document.selection.getFirstPosition().parent;

		if ( listItem && listItem.hasAttribute( 'listItemId' ) && listItem.getAttribute( 'listType' ) == 'numbered' ) {
			return listItem.getAttribute( 'listReversed' );
		}

		return null;
	}
}
