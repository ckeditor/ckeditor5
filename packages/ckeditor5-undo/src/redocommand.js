/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
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
 *
 * @extends module:undo/basecommand~BaseCommand
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
	execute() {
		const item = this._stack.pop();

		// All changes have to be done in one `enqueueChanges` callback so other listeners will not
		// step between consecutive deltas, or won't do changes to the document before selection is properly restored.
		this.editor.document.enqueueChanges( () => {
			const lastDelta = item.batch.deltas[ item.batch.deltas.length - 1 ];
			const nextBaseVersion = lastDelta.baseVersion + lastDelta.operations.length;
			const deltas = this.editor.document.history.getDeltas( nextBaseVersion );

			this._restoreSelection( item.selection.ranges, item.selection.isBackward, deltas );
			this._undo( item.batch );
		} );

		this.refresh();
	}
}
