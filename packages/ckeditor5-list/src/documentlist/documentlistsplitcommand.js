/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/documentlistsplitcommand
 */

import { Command } from 'ckeditor5/src/core';
import {
	isFirstBlockOfListItem,
	isListItemBlock,
	sortBlocks,
	splitListItemBefore
} from './utils/model';

/**
 * The document list split command that splits the list item at the selection.
 *
 * It is used by the {@link module:list/documentlist~DocumentList document list feature}.
 *
 * @extends module:core/command~Command
 */
export default class DocumentListSplitCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {'before'|'after'} direction Whether list item should be split before or after the selected block.
	 */
	constructor( editor, direction ) {
		super( editor );

		/**
		 * Whether list item should be split before or after the selected block.
		 *
		 * @readonly
		 * @private
		 * @member {'before'|'after'}
		 */
		this._direction = direction;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Splits the list item at the selection.
	 *
	 * @fires execute
	 * @fires afterExecute
	 */
	execute() {
		const editor = this.editor;

		editor.model.change( writer => {
			const changedBlocks = splitListItemBefore( this._getStartBlock(), writer );

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
		const selection = this.editor.model.document.selection;
		const block = this._getStartBlock();

		return selection.isCollapsed &&
			isListItemBlock( block ) &&
			!isFirstBlockOfListItem( block );
	}

	/**
	 * Returns the model element that is the main focus of the command (according to the current selection and command direction).
	 *
	 * @private
	 * @returns {module:engine/model/element~Element}
	 */
	_getStartBlock() {
		const doc = this.editor.model.document;
		const positionParent = doc.selection.getFirstPosition().parent;

		return this._direction == 'before' ? positionParent : positionParent.nextSibling;
	}
}
