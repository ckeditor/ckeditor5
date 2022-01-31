/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module undo/undocommand
 */

import BaseCommand from './basecommand';

/**
 * The undo command stores {@link module:engine/model/batch~Batch batches} applied to the
 * {@link module:engine/model/document~Document document} and is able to undo a batch by reversing it and transforming by
 * batches from {@link module:engine/model/document~Document#history history} that happened after the reversed batch.
 *
 * The undo command also takes care of restoring the {@link module:engine/model/document~Document#selection document selection}.
 *
 * @extends module:undo/basecommand~BaseCommand
 */
export default class UndoCommand extends BaseCommand {
	/**
	 * Executes the command. This method reverts a {@link module:engine/model/batch~Batch batch} added to the command's stack, transforms
	 * and applies the reverted version on the {@link module:engine/model/document~Document document} and removes the batch from the stack.
	 * Then, it restores the {@link module:engine/model/document~Document#selection document selection}.
	 *
	 * @fires execute
	 * @fires revert
	 * @param {module:engine/model/batch~Batch} [batch] A batch that should be undone. If not set, the last added batch will be undone.
	 */
	execute( batch = null ) {
		// If batch is not given, set `batchIndex` to the last index in command stack.
		const batchIndex = batch ? this._stack.findIndex( a => a.batch == batch ) : this._stack.length - 1;

		const item = this._stack.splice( batchIndex, 1 )[ 0 ];
		const undoingBatch = this.editor.model.createBatch( { isUndo: true } );

		// All changes has to be done in one `enqueueChange` callback so other listeners will not
		// step between consecutive operations, or won't do changes to the document before selection is properly restored.
		this.editor.model.enqueueChange( undoingBatch, () => {
			this._undo( item.batch, undoingBatch );

			const operations = this.editor.model.document.history.getOperations( item.batch.baseVersion );
			this._restoreSelection( item.selection.ranges, item.selection.isBackward, operations );

			this.fire( 'revert', item.batch, undoingBatch );
		} );

		this.refresh();
	}
}

/**
 * Fired when execution of the command reverts some batch.
 *
 * @event revert
 */
