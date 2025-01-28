/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module undo/undocommand
 */

import BaseCommand from './basecommand.js';
import type { Batch } from '@ckeditor/ckeditor5-engine';

/**
 * The undo command stores {@link module:engine/model/batch~Batch batches} applied to the
 * {@link module:engine/model/document~Document document} and is able to undo a batch by reversing it and transforming by
 * batches from {@link module:engine/model/document~Document#history history} that happened after the reversed batch.
 *
 * The undo command also takes care of restoring the {@link module:engine/model/document~Document#selection document selection}.
 */
export default class UndoCommand extends BaseCommand {
	/**
	 * Executes the command. This method reverts a {@link module:engine/model/batch~Batch batch} added to the command's stack, transforms
	 * and applies the reverted version on the {@link module:engine/model/document~Document document} and removes the batch from the stack.
	 * Then, it restores the {@link module:engine/model/document~Document#selection document selection}.
	 *
	 * @fires execute
	 * @fires revert
	 * @param batch A batch that should be undone. If not set, the last added batch will be undone.
	 */
	public override execute( batch: Batch | null = null ): void {
		// If batch is not given, set `batchIndex` to the last index in command stack.
		const batchIndex = batch ? this._stack.findIndex( a => a.batch == batch ) : this._stack.length - 1;

		const item = this._stack.splice( batchIndex, 1 )[ 0 ];
		const undoingBatch = this.editor.model.createBatch( { isUndo: true } );

		// All changes have to be done in one `enqueueChange` callback so other listeners will not
		// step between consecutive operations, or won't do changes to the document before selection is properly restored.
		this.editor.model.enqueueChange( undoingBatch, () => {
			this._undo( item.batch, undoingBatch );

			const operations = this.editor.model.document.history.getOperations( item.batch.baseVersion! );
			this._restoreSelection( item.selection.ranges, item.selection.isBackward, operations );
		} );

		// Firing `revert` event after the change block to make sure that it includes all changes from post-fixers
		// and make sure that the selection is "stabilized" (the selection range is saved after undo is executed and then
		// restored on redo, so it is important that the selection range is saved after post-fixers are done).
		this.fire<UndoCommandRevertEvent>( 'revert', item.batch, undoingBatch );

		this.refresh();
	}
}

/**
 * Fired when execution of the command reverts some batch.
 *
 * @eventName ~UndoCommand#revert
 */
export type UndoCommandRevertEvent = {
	name: 'revert';
	args: [ batch: Batch, undoingBatch: Batch ];
};
