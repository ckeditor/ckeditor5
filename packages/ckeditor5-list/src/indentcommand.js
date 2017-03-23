/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module list/indentcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command/command';
import first from '@ckeditor/ckeditor5-utils/src/first';

/**
 * The list indent command. It is used by the {@link module:list/list~List list feature}.
 *
 * @extends core.command.Command
 */
export default class IndentCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 * @param {'forward'|'backward'} indentDirection Direction of indent. If it is equal to `backward`, the command
	 * will outdent a list item.
	 */
	constructor( editor, indentDirection ) {
		super( editor );

		/**
		 * By how much the command will change list item's indent attribute.
		 *
		 * @readonly
		 * @private
		 * @member {Number}
		 */
		this._indentBy = indentDirection == 'forward' ? 1 : -1;

		// Refresh command state after selection is changed or changes has been done to the document.
		this.listenTo( editor.document.selection, 'change:range', () => {
			this.refreshState();
		} );

		this.listenTo( editor.document, 'changesDone', () => {
			this.refreshState();
		} );
	}

	/**
	 * @inheritDoc
	 */
	_doExecute() {
		const doc = this.editor.document;
		const batch = doc.batch();
		let itemsToChange = Array.from( doc.selection.getSelectedBlocks() );

		doc.enqueueChanges( () => {
			const lastItem = itemsToChange[ itemsToChange.length - 1 ];

			// Indenting a list item should also indent all the items that are already sub-items of indented item.
			let next = lastItem.nextSibling;

			// Check all items after last indented item, as long as their indent is bigger than indent of that item.
			while ( next && next.name == 'listItem' && next.getAttribute( 'indent' ) > lastItem.getAttribute( 'indent' ) ) {
				itemsToChange.push( next );

				next = next.nextSibling;
			}

			// We need to be sure to keep model in correct state after each small change, because converters
			// bases on that state and assumes that model is correct.
			// Because of that, if the command outdented items, we will outdent them starting from the last item, as
			// it is safer.
			if ( this._indentBy < 0 ) {
				itemsToChange = itemsToChange.reverse();
			}

			for ( let item of itemsToChange ) {
				const indent = item.getAttribute( 'indent' ) + this._indentBy;

				// If indent is lower than 0, it means that the item got outdented when it was not indented.
				// This means that we need to convert that list item to paragraph.
				if ( indent < 0 ) {
					// To keep the model as correct as possible, first rename listItem, then remove attributes,
					// as listItem without attributes is very incorrect and will cause problems in converters.
					// No need to remove attributes, will be removed by post fixer.
					batch.rename( item, 'paragraph' );
				}
				// If indent is >= 0, change the attribute value.
				else {
					// If indent is > 0 and the item was outdented, check whether list item's type should not be fixed.
					if ( indent > 0 && this._indentBy < 0 ) {
						// First, find previous sibling with same indent.
						let prev = item.previousSibling;

						while ( prev.getAttribute( 'indent' ) > indent ) {
							prev = prev.previousSibling;
						}

						// Then check if that sibling has same type. If not, change type of this item.
						if ( prev.getAttribute( 'type' ) != item.getAttribute( 'type' ) ) {
							batch.setAttribute( item, 'type', prev.getAttribute( 'type' ) );
						}
					}

					batch.setAttribute( item, 'indent', indent );
				}
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	_checkEnabled() {
		// Check whether any of position's ancestor is a list item.
		const listItem = first( this.editor.document.selection.getSelectedBlocks() );

		// If selection is not in a list item, the command is disabled.
		if ( !listItem ) {
			return false;
		}

		const prev = listItem.previousSibling;
		const oldIndent = listItem.getAttribute( 'indent' );
		const newIndent = oldIndent + this._indentBy;

		if ( this._indentBy > 0 ) {
			// If we are indenting, there are some conditions to meet.
			// Cannot indent first list item.
			if ( !prev || prev.name != 'listItem' ) {
				return false;
			}

			// Indent can be at most greater by one than indent of previous item.
			if ( prev.getAttribute( 'indent' ) + 1 < newIndent ) {
				return false;
			}
		}

		// If we are outdenting it is enough to be in list item. Every list item can always be outdented.
		return true;
	}
}
