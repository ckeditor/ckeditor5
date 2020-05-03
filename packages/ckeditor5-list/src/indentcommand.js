/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/indentcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import first from '@ckeditor/ckeditor5-utils/src/first';

/**
 * The list indent command. It is used by the {@link module:list/list~List list feature}.
 *
 * @extends module:core/command~Command
 */
export default class IndentCommand extends Command {
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
	 */
	execute() {
		const model = this.editor.model;
		const doc = model.document;
		let itemsToChange = Array.from( doc.selection.getSelectedBlocks() );

		model.change( writer => {
			const lastItem = itemsToChange[ itemsToChange.length - 1 ];

			// Indenting a list item should also indent all the items that are already sub-items of indented item.
			let next = lastItem.nextSibling;

			// Check all items after last indented item, as long as their indent is bigger than indent of that item.
			while ( next && next.name == 'listItem' && next.getAttribute( 'listIndent' ) > lastItem.getAttribute( 'listIndent' ) ) {
				itemsToChange.push( next );

				next = next.nextSibling;
			}

			// We need to be sure to keep model in correct state after each small change, because converters
			// bases on that state and assumes that model is correct.
			// Because of that, if the command outdents items, we will outdent them starting from the last item, as
			// it is safer.
			if ( this._indentBy < 0 ) {
				itemsToChange = itemsToChange.reverse();
			}

			for ( const item of itemsToChange ) {
				const indent = item.getAttribute( 'listIndent' ) + this._indentBy;

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
		const listItem = first( this.editor.model.document.selection.getSelectedBlocks() );

		// If selection is not in a list item, the command is disabled.
		if ( !listItem || !listItem.is( 'listItem' ) ) {
			return false;
		}

		if ( this._indentBy > 0 ) {
			// Cannot indent first item in it's list. Check if before `listItem` is a list item that is in same list.
			// To be in the same list, the item has to have same attributes and cannot be "split" by an item with lower indent.
			const indent = listItem.getAttribute( 'listIndent' );
			const type = listItem.getAttribute( 'listType' );

			let prev = listItem.previousSibling;

			while ( prev && prev.is( 'listItem' ) && prev.getAttribute( 'listIndent' ) >= indent ) {
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
