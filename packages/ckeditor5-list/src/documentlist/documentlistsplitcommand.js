/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/documentlistsplitcommand
 */

import { Command } from 'ckeditor5/src/core';
import {
	isFirstBlockOfListItem,
	sortBlocks,
	splitListItemBefore
} from './utils/model';

/**
 * The document list split command that splits the list item at the first position of the selection.
 *
 * It is used by the {@link module:list/documentlist~DocumentList document list feature}.
 *
 * @extends module:core/command~Command
 */
export default class DocumentListSplitCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Splits the list item at the first position of the selection.
	 *
	 * @fires execute
	 * @fires afterExecute
	 */
	execute() {
		const editor = this.editor;

		editor.model.change( writer => {
			const positionParent = editor.model.document.selection.getFirstPosition().parent;
			const changedBlocks = splitListItemBefore( positionParent, writer );

			this._fireAfterExecute( changedBlocks );
		} );
	}

	/**
	 * Fires the `afterExecute` event.
	 *
	 * @private
	 * @param {Array.<module:engine/model/element~Element>} changedBlocks The changed list elements.
	 */
	_fireAfterExecute( changedBlocks ) {
		/**
		 * Event fired by the {@link #execute} method.
		 *
		 * It allows to execute an action after executing the {@link ~DocumentListSplitCommand#execute} method,
		 * for example adjusting attributes of changed list items.
		 *
		 * @protected
		 * @event afterExecute
		 */
		this.fire( 'afterExecute', sortBlocks( new Set( changedBlocks ) ) );
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled() {
		const doc = this.editor.model.document;
		const positionParent = doc.selection.getFirstPosition().parent;

		return doc.selection.isCollapsed &&
			positionParent.hasAttribute( 'listItemId' ) &&
			!isFirstBlockOfListItem( positionParent );
	}
}
