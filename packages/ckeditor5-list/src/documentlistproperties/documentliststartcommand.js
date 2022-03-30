/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
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
 *
 * @extends module:core/command~Command
 */
export default class DocumentListStartCommand extends Command {
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
	 * @param {Number} [options.startIndex=1] The list start index.
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;

		let blocks = Array.from( document.selection.getSelectedBlocks() )
			.filter( block => isListItemBlock( block ) && block.getAttribute( 'listType' ) == 'numbered' );

		blocks = expandListBlocksToCompleteList( blocks );

		model.change( writer => {
			for ( const block of blocks ) {
				writer.setAttribute( 'listStart', options.startIndex || 1, block );
			}
		} );
	}

	/**
	 * Checks the command's {@link #value}.
	 *
	 * @private
	 * @returns {Number|null} The current value.
	 */
	_getValue() {
		const model = this.editor.model;
		const document = model.document;

		const block = first( document.selection.getSelectedBlocks() );

		if ( block && isListItemBlock( block ) && block.getAttribute( 'listType' ) == 'numbered' ) {
			return block.getAttribute( 'listStart' );
		}

		return null;
	}
}
