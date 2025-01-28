/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/list/listindentcommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import type { DocumentSelection, Element } from 'ckeditor5/src/engine.js';

import {
	expandListBlocksToCompleteItems,
	indentBlocks,
	isFirstBlockOfListItem,
	isListItemBlock,
	isSingleListItem,
	outdentBlocksWithMerge,
	sortBlocks,
	splitListItemBefore,
	type ListElement
} from './utils/model.js';
import ListWalker from './utils/listwalker.js';

/**
 * The document list indent command. It is used by the {@link module:list/list~List list feature}.
 */
export default class ListIndentCommand extends Command {
	/**
	 * Determines by how much the command will change the list item's indent attribute.
	 */
	private readonly _direction: 'forward' | 'backward';

	/**
	 * Creates an instance of the command.
	 *
	 * @param editor The editor instance.
	 * @param indentDirection The direction of indent. If it is equal to `backward`, the command
	 * will outdent a list item.
	 */
	constructor( editor: Editor, indentDirection: 'forward' | 'backward' ) {
		super( editor );

		this._direction = indentDirection;
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Indents or outdents (depending on the {@link #constructor}'s `indentDirection` parameter) selected list items.
	 *
	 * @fires execute
	 * @fires afterExecute
	 */
	public override execute(): void {
		const model = this.editor.model;
		const blocks = getSelectedListBlocks( model.document.selection );

		model.change( writer => {
			const changedBlocks = [];

			// Handle selection contained in the single list item and starting in the following blocks.
			if ( isSingleListItem( blocks ) && !isFirstBlockOfListItem( blocks[ 0 ] ) ) {
				// Allow increasing indent of following list item blocks.
				if ( this._direction == 'forward' ) {
					changedBlocks.push( ...indentBlocks( blocks, writer ) );
				}

				// For indent make sure that indented blocks have a new ID.
				// For outdent just split blocks from the list item (give them a new IDs).
				changedBlocks.push( ...splitListItemBefore( blocks[ 0 ], writer ) );
			}
			// More than a single list item is selected, or the first block of list item is selected.
			else {
				// Now just update the attributes of blocks.
				if ( this._direction == 'forward' ) {
					changedBlocks.push( ...indentBlocks( blocks, writer, { expand: true } ) );
				} else {
					changedBlocks.push( ...outdentBlocksWithMerge( blocks, writer ) );
				}
			}

			// Align the list item type to match the previous list item (from the same list).
			for ( const block of changedBlocks ) {
				// This block become a plain block (for example a paragraph).
				if ( !block.hasAttribute( 'listType' ) ) {
					continue;
				}

				const previousItemBlock = ListWalker.first( block, { sameIndent: true } );

				if ( previousItemBlock ) {
					writer.setAttribute( 'listType', previousItemBlock.getAttribute( 'listType' ), block );
				}
			}

			this._fireAfterExecute( changedBlocks );
		} );
	}

	/**
	 * Fires the `afterExecute` event.
	 *
	 * @param changedBlocks The changed list elements.
	 */
	private _fireAfterExecute( changedBlocks: Array<Element> ) {
		this.fire<ListIndentCommandAfterExecuteEvent>( 'afterExecute', sortBlocks( new Set( changedBlocks ) ) );
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */
	private _checkEnabled(): boolean {
		// Check whether any of position's ancestor is a list item.
		let blocks = getSelectedListBlocks( this.editor.model.document.selection );
		let firstBlock = blocks[ 0 ];

		// If selection is not in a list item, the command is disabled.
		if ( !firstBlock ) {
			return false;
		}

		// If we are outdenting it is enough to be in list item. Every list item can always be outdented.
		if ( this._direction == 'backward' ) {
			return true;
		}

		// A single block of a list item is selected, so it could be indented as a sublist.
		if ( isSingleListItem( blocks ) && !isFirstBlockOfListItem( blocks[ 0 ] ) ) {
			return true;
		}

		blocks = expandListBlocksToCompleteItems( blocks );
		firstBlock = blocks[ 0 ];

		// Check if there is any list item before selected items that could become a parent of selected items.
		const siblingItem = ListWalker.first( firstBlock, { sameIndent: true } );

		if ( !siblingItem ) {
			return false;
		}

		if ( siblingItem.getAttribute( 'listType' ) == firstBlock.getAttribute( 'listType' ) ) {
			return true;
		}

		return false;
	}
}

/**
 * Returns an array of selected blocks truncated to the first non list block element.
 */
function getSelectedListBlocks( selection: DocumentSelection ) {
	const blocks = Array.from( selection.getSelectedBlocks() );
	const firstNonListBlockIndex = blocks.findIndex( block => !isListItemBlock( block ) );

	if ( firstNonListBlockIndex != -1 ) {
		blocks.length = firstNonListBlockIndex;
	}

	return blocks as Array<ListElement>;
}

/**
 * Event fired by the {@link ~ListIndentCommand#execute} method.
 *
 * It allows to execute an action after executing the {@link module:list/list/listcommand~ListCommand#execute}
 * method, for example adjusting attributes of changed list items.
 *
 * @internal
 * @eventName ~ListIndentCommand#afterExecute
 */
export type ListIndentCommandAfterExecuteEvent = {
	name: 'afterExecute';
	args: [ changedBlocks: Array<Element> ];
};
