/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/documentlistindentcommand
 */

import { Command } from 'ckeditor5/src/core';
import { first } from 'ckeditor5/src/utils';
import { getNestedListItems, getSiblingListItem } from './utils';

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
		const doc = model.document;
		const blocks = Array.from( doc.selection.getSelectedBlocks() );

		// TODO outdent of the following block of list item should split it from previous block
		// TODO intdent of the following block of list item should do nothing

		model.change( writer => {
			// const firstItem = blocks[ 0 ];
			const lastItem = blocks[ blocks.length - 1 ];

			// Indenting a list item should also indent all the items that are already sub-items of indented item.
			for ( const block of getNestedListItems( lastItem ) ) {
				blocks.push( block );
			}

			for ( const item of blocks ) {
				const indent = item.getAttribute( 'listIndent' ) + this._indentBy;

				if ( indent < 0 ) {
					for ( const attributeKey of item.getAttributeKeys() ) {
						if ( attributeKey.startsWith( 'list' ) ) {
							writer.removeAttribute( attributeKey, item );
						}
					}
				} else {
					writer.setAttribute( 'listIndent', indent, item );
					// TODO alter the listItemId
				}
			}

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
		const listItem = first( this.editor.model.document.selection.getSelectedBlocks() );

		// If selection is not in a list item, the command is disabled.
		if ( !listItem || !listItem.hasAttribute( 'listItemId' ) ) {
			return false;
		}

		// If we are outdenting it is enough to be in list item. Every list item can always be outdented.
		if ( this._indentBy < 0 ) {
			return true;
		}

		const siblingItem = getSiblingListItem( listItem.previousSibling, {
			listIndent: listItem.getAttribute( 'listIndent' ),
			sameIndent: true
		} );

		if ( !siblingItem ) {
			return false;
		}

		return siblingItem.getAttribute( 'listType' ) == listItem.getAttribute( 'listType' );
	}
}
