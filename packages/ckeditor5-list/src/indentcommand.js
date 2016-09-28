/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '../core/command/command.js';
import { getClosestListItem } from './utils.js';

/**
 * The list indent command. It is used by the {@link list.List list feature}.
 *
 * @memberOf list
 * @extends core.command.Command
 */
export default class IndentCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {core.editor.Editor} editor Editor instance.
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
		 * @member {Number} list.IndentCommand#_indentBy
		 */
		this._indentBy = indentDirection == 'forward' ? 1 : -1;

		// Refresh command state after selection is changed or changes has been done to the document.
		this.editor.document.selection.on( 'change:range', () => {
			this.refreshState();
		} );

		this.editor.document.on( 'changesDone', () => {
			this.refreshState();
		} );
	}

	/**
	 * @inheritDoc
	 */
	_doExecute() {
		const doc = this.editor.document;
		const batch = doc.batch();
		const element = getClosestListItem( doc.selection.getFirstPosition() );

		doc.enqueueChanges( () => {
			const oldIndent = element.getAttribute( 'indent' );

			let itemsToChange = [ element ];

			// Indenting a list item should also indent all the items that are already sub-items of indented item.
			let next = element.nextSibling;

			// Check all items as long as their indent is bigger than indent of changed list item.
			while ( next && next.name == 'listItem' && next.getAttribute( 'indent' ) > oldIndent ) {
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
					batch.rename( item, 'paragraph' ).removeAttribute( item, 'indent' ).removeAttribute( item, 'type' );
				} else {
					// If indent is >= 0, just change the attribute value.
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
		const listItem = getClosestListItem( this.editor.document.selection.getFirstPosition() );

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
