/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/documentlistmergecommand
 */

import { Command } from 'ckeditor5/src/core';
import {
	indentBlocks,
	mergeListItemBefore
} from './utils/model';

/**
 * TODO
 * The document list indent command. It is used by the {@link module:list/documentlist~DocumentList list feature}.
 *
 * @extends module:core/command~Command
 */
export default class DocumentListMergeCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * TODO
	 *
	 * @fires execute
	 * @fires afterExecute
	 */
	execute() {
		const model = this.editor.model;
		const selection = model.document.selection;

		// Backspace handling
		// - Collapsed selection at the beginning of the first item of list
		//   -> outdent command
		// - Collapsed selection at the beginning of the first block of an item
		//   - Item before is empty
		//     -> change indent to match previous (with sub lists)
		//     -> standard delete command
		//   - Item before is not empty
		//     -> change indent to match previous
		//     -> merge block with previous item
		// - Non-collapsed selection with first position in the first block of a list item and the last position in other item
		//   - first position in empty block
		//     -> change indent of the last block to match the first block
		//     -> standard delete command
		//   - first position in non-empty block
		//     -> change indent of the last block to match the first block
		//     -> standard delete command
		//     -> merge last block with the first block

		model.change( writer => {
			const firstPosition = selection.getFirstPosition();
			const firstPositionParent = firstPosition.parent;
			const firstNode = selection.isCollapsed ? firstPositionParent.previousSibling : firstPositionParent;
			const lastNode = selection.getLastPosition().parent;

			const firstIndent = firstNode.getAttribute( 'listIndent' );
			const lastIndent = lastNode.getAttribute( 'listIndent' );

			if ( firstIndent != lastIndent ) {
				indentBlocks( lastNode, writer, { expand: true, indentBy: firstIndent - lastIndent } );
			}

			if ( firstNode.isEmpty || !selection.isCollapsed ) {
				let sel = selection;

				if ( selection.isCollapsed ) {
					sel = writer.createSelection( selection );
					model.modifySelection( sel, { direction: 'backward' } );
				}

				model.deleteContent( sel, { doNotResetEntireContent: true } );
			}

			if ( !firstNode.isEmpty ) {
				mergeListItemBefore( lastNode, firstNode, writer );
			}

			// TODO this._fireAfterExecute()
		} );
	}

	/**
	 * TODO
	 *
	 * @private
	 * @param {Array.<module:engine/model/element~Element>} changedBlocks The changed list elements.
	 */
	_fireAfterExecute( changedBlocks ) {
		/**
		 * Event fired by the {@link #execute} method.
		 *
		 * It allows to execute an action after executing the {@link ~DocumentListIndentCommand#execute} method,
		 * for example adjusting attributes of changed list items.
		 *
		 * @protected
		 * @event afterExecute
		 */
		this.fire( 'afterExecute', changedBlocks );
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const firstPosition = selection.getFirstPosition();
		const firstPositionParent = firstPosition.parent;
		const firstNode = selection.isCollapsed ? firstPositionParent.previousSibling : firstPositionParent;

		if ( !firstNode || !firstNode.hasAttribute( 'listItemId' ) ) {
			return false;
		}

		return firstPosition.isAtStart;
	}
}
