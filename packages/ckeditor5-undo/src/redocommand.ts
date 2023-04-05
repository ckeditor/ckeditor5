/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module undo/redocommand
 */

import BaseCommand from './basecommand';

/**
 * The redo command stores {@link module:engine/model/batch~Batch batches} that were used to undo a batch by
 * {@link module:undo/undocommand~UndoCommand}. It is able to redo a previously undone batch by reversing the undoing
 * batches created by `UndoCommand`. The reversed batch is transformed by all the batches from
 * {@link module:engine/model/document~Document#history history} that happened after the reversed undo batch.
 *
 * The redo command also takes care of restoring the {@link module:engine/model/document~Document#selection document selection}.
 */
export default class RedoCommand extends BaseCommand {
	/**
	 * Executes the command. This method reverts the last {@link module:engine/model/batch~Batch batch} added to
	 * the command's stack, applies the reverted and transformed version on the
	 * {@link module:engine/model/document~Document document} and removes the batch from the stack.
	 * Then, it restores the {@link module:engine/model/document~Document#selection document selection}.
	 *
	 * @fires execute
	 */
	public override execute(): void {
		const item = this._stack.pop()!;
		const redoingBatch = this.editor.model.createBatch( { isUndo: true } );

		// All changes have to be done in one `enqueueChange` callback so other listeners will not step between consecutive
		// operations, or won't do changes to the document before selection is properly restored.
		this.editor.model.enqueueChange( redoingBatch, () => {
			const lastOperation = item.batch.operations[ item.batch.operations.length - 1 ];
			const nextBaseVersion = lastOperation.baseVersion! + 1;
			const operations = this.editor.model.document.history.getOperations( nextBaseVersion );

			this._restoreSelection( item.selection.ranges, item.selection.isBackward, operations );
			this._undo( item.batch, redoingBatch );
		} );

		this.refresh();
	}
}
