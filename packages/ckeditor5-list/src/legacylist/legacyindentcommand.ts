/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/legacylist/legacyindentcommand
 */

import type { Element } from 'ckeditor5/src/engine.js';
import { Command, type Editor } from 'ckeditor5/src/core.js';
import { first } from 'ckeditor5/src/utils.js';

/**
 * The list indent command. It is used by the {@link module:list/legacylist~LegacyList legacy list feature}.
 */
export default class LegacyIndentCommand extends Command {
	/**
	 * Determines by how much the command will change the list item's indent attribute.
	 */
	private readonly _indentBy: 1 | -1;

	/**
	 * Creates an instance of the command.
	 *
	 * @param editor The editor instance.
	 * @param indentDirection The direction of indent. If it is equal to `backward`, the command will outdent a list item.
	 */
	constructor( editor: Editor, indentDirection: 'forward' | 'backward' ) {
		super( editor );

		this._indentBy = indentDirection == 'forward' ? 1 : -1;
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
	 */
	public override execute(): void {
		const model = this.editor.model;
		const doc = model.document;
		let itemsToChange = Array.from( doc.selection.getSelectedBlocks() );

		model.change( writer => {
			const lastItem = itemsToChange[ itemsToChange.length - 1 ];

			// Indenting a list item should also indent all the items that are already sub-items of indented item.
			let next = lastItem.nextSibling as Element | null;

			// Check all items after last indented item, as long as their indent is bigger than indent of that item.
			while (
				next && next.name == 'listItem' &&
				( next.getAttribute( 'listIndent' ) as number ) > ( lastItem.getAttribute( 'listIndent' ) as number )
			) {
				itemsToChange.push( next );

				next = next.nextSibling as Element | null;
			}

			// We need to be sure to keep model in correct state after each small change, because converters
			// bases on that state and assumes that model is correct.
			// Because of that, if the command outdents items, we will outdent them starting from the last item, as
			// it is safer.
			if ( this._indentBy < 0 ) {
				itemsToChange = itemsToChange.reverse();
			}

			for ( const item of itemsToChange ) {
				const indent = ( item.getAttribute( 'listIndent' ) as number ) + this._indentBy;

				// If indent is lower than 0, it means that the item got outdented when it was not indented.
				// This means that we need to convert that list item to paragraph.
				if ( indent < 0 ) {
					// To keep the model as correct as possible, first rename listItem, then remove attributes,
					// as listItem without attributes is very incorrect and will cause problems in converters.
					// No need to remove attributes, will be removed by post fixer.
					writer.rename( item, 'paragraph' );
				}
				// If indent is >= 0, change the attribute value.
				else {
					writer.setAttribute( 'listIndent', indent, item );
				}
			}

			// It allows to execute an action after executing the `~IndentCommand#execute` method, for example adjusting
			// attributes of changed list items.
			this.fire( '_executeCleanup', itemsToChange );
		} );
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @returns Whether the command should be enabled.
	 */
	private _checkEnabled() {
		// Check whether any of position's ancestor is a list item.
		const listItem = first( this.editor.model.document.selection.getSelectedBlocks() );

		// If selection is not in a list item, the command is disabled.
		if ( !listItem || !listItem.is( 'element', 'listItem' ) ) {
			return false;
		}

		if ( this._indentBy > 0 ) {
			// Cannot indent first item in it's list. Check if before `listItem` is a list item that is in same list.
			// To be in the same list, the item has to have same attributes and cannot be "split" by an item with lower indent.
			const indent = listItem.getAttribute( 'listIndent' ) as number;
			const type = listItem.getAttribute( 'listType' ) as string;

			let prev = listItem.previousSibling;

			while ( prev && prev.is( 'element', 'listItem' ) && ( prev.getAttribute( 'listIndent' ) as number ) >= indent ) {
				if ( prev.getAttribute( 'listIndent' ) == indent ) {
					// The item is on the same level.
					// If it has same type, it means that we found a preceding sibling from the same list.
					// If it does not have same type, it means that `listItem` is on different list (this can happen only
					// on top level lists, though).
					return prev.getAttribute( 'listType' ) == type;
				}

				prev = prev.previousSibling;
			}

			// Could not find similar list item, this means that `listItem` is first in its list.
			return false;
		}

		// If we are outdenting it is enough to be in list item. Every list item can always be outdented.
		return true;
	}
}
