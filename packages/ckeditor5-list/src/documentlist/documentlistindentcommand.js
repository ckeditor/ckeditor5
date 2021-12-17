/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/documentlistindentcommand
 */

import { Command } from 'ckeditor5/src/core';
import {
	expandListBlocksToCompleteItems,
	getSiblingListBlock,
	indentBlocks,
	isFirstBlockOfListItem,
	splitListItemBefore
} from './utils/model';

/**
 * The document list indent command. It is used by the {@link module:list/documentlist~DocumentList list feature}.
 *
 * @extends module:core/command~Command
 */
export default class DocumentListIndentCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {'forward'|'backward'} indentDirection The direction of indent. If it is equal to `backward`, the command
	 * will outdent a list item.
	 */
	constructor( editor, indentDirection ) {
		super( editor );

		/**
		 * Determines by how much the command will change the list item's indent attribute.
		 *
		 * @readonly
		 * @private
		 * @member {Number}
		 */
		this._indentBy = indentDirection == 'forward' ? 1 : -1;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Indents or outdents (depending on the {@link #constructor}'s `indentDirection` parameter) selected list items.
	 *
	 * @fires execute
	 * @fires _executeCleanup
	 */
	execute() {
		const model = this.editor.model;
		const blocks = getSelectedListBlocks( model.document.selection );

		model.change( writer => {
			// Handle selection contained in the single list item and starting in the following blocks.
			if ( startsInTheMiddleOfTheOnlyOneSelectedListItem( blocks ) ) {
				// Do nothing while indenting, but split list item on outdent.
				if ( this._indentBy < 0 ) {
					splitListItemBefore( blocks[ 0 ], writer );
				}

				return;
			}

			// Expand the selected blocks to contain the whole list items.
			expandListBlocksToCompleteItems( blocks );

			// Now just update the attributes of blocks.
			indentBlocks( blocks, this._indentBy, writer );

			/**
			 * Event fired by the {@link #execute} method.
			 *
			 * It allows to execute an action after executing the {@link ~DocumentListIndentCommand#execute} method,
			 * for example adjusting attributes of changed list items.
			 *
			 * @protected
			 * @event afterExecute
			 */
			this.fire( 'afterExecute', blocks );
		} );
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled() {
		// Check whether any of position's ancestor is a list item.
		const blocks = getSelectedListBlocks( this.editor.model.document.selection );
		let firstBlock = blocks[ 0 ];

		// If selection is not in a list item, the command is disabled.
		if ( !firstBlock ) {
			return false;
		}

		// If we are outdenting it is enough to be in list item. Every list item can always be outdented.
		if ( this._indentBy < 0 ) {
			return true;
		}

		// Indenting of the following blocks of a list item is not allowed.
		if ( startsInTheMiddleOfTheOnlyOneSelectedListItem( blocks ) ) {
			return false;
		}

		expandListBlocksToCompleteItems( blocks );
		firstBlock = blocks[ 0 ];

		// Check if there is any list item before selected items that could become a parent of selected items.
		const siblingItem = getSiblingListBlock( firstBlock.previousSibling, {
			listIndent: firstBlock.getAttribute( 'listIndent' ),
			sameIndent: true
		} );

		if ( !siblingItem ) {
			return false;
		}

		if ( siblingItem.getAttribute( 'listType' ) == firstBlock.getAttribute( 'listType' ) ) {
			return true;
		}

		return false;
	}
}

// Returns an array of selected blocks truncated to the first non list block element.
function getSelectedListBlocks( selection ) {
	const blocks = Array.from( selection.getSelectedBlocks() );
	const firstNonListBlockIndex = blocks.findIndex( block => !block.hasAttribute( 'listItemId' ) );

	if ( firstNonListBlockIndex != -1 ) {
		blocks.length = firstNonListBlockIndex;
	}

	return blocks;
}

// Checks whether the given blocks are related to a single list item and does not include the first block of the list item.
// TODO split into 2 helpers
function startsInTheMiddleOfTheOnlyOneSelectedListItem( blocks ) {
	const firstItem = blocks[ 0 ];

	// It's not a middle block;
	if ( isFirstBlockOfListItem( firstItem ) ) {
		return false;
	}

	const firstItemId = firstItem.getAttribute( 'listItemId' );
	const isSingleListItemSelected = !blocks.some( item => item.getAttribute( 'listItemId' ) != firstItemId );

	// Is only one list item is selected?
	return isSingleListItemSelected;
}
