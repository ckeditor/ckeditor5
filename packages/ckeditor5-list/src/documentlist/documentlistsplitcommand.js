/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { Command } from 'ckeditor5/src/core';
import {
	sortBlocks
} from './utils/model';

/**
 * The list split command. It is used by the {@link module:list/documentlist~DocumentList document list feature}.
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
	 * TODO
	 *
	 * @fires execute
	 * @fires afterExecute
	 */
	execute() {
		// const editor = this.editor;
		// const model = editor.model;
		// const selection = model.document.selection;
		// const firstPosition = selection.getFirstPosition();

		// if ( selection.isCollapsed ) {
		// }

		// if ( empty list item ) {
		// 	outdent list item

		// 	return;
		// }

		// if ( in first block ) {

		// }

		// if ( single block in item ) {
		// 	if ( at end ) {
		// 		create list item after
		// 	} else {
		// 		split list item
		// 	}
		// } else if ( multiple blocks in item ) {
		// 	split block
		// }
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
		 * It allows to execute an action after executing the {@link ~TODO#execute} method,
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
		// TODO

		return true;
	}
}
