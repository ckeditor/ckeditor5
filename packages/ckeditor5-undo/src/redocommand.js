/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BaseCommand from './basecommand.js';
import { transformDelta as transformDelta } from './basecommand.js';

/**
 * The redo command stores {@link engine.model.Batch batches} that were used to undo a batch by {@link undo.UndoCommand UndoCommand}.
 * It is able to redo a previously undone batch by reversing the undoing batches created by `UndoCommand`. The reversed batch is
 * also transformed by batches from {@link engine.model.Document#history history} that happened after it and are not other redo batches.
 *
 * The redo command also takes care of restoring the {@link engine.model.Document#selection document selection} to the state before
 * an undone batch was applied.
 *
 * @memberOf undo
 * @extends undo.BaseCommand
 */
export default class RedoCommand extends BaseCommand {
	/**
	 * Executes the command. This method reverts the last {@link engine.model.Batch batch} added to the command's stack, applies
	 * the reverted and transformed version on the {@link engine.model.Document document} and removes the batch from the stack.
	 * Then, it restores the {@link engine.model.Document#selection document selection}.
	 *
	 * @protected
	 */
	_doExecute() {
		const item = this._stack.pop();

		// All changes have to be done in one `enqueueChanges` callback so other listeners will not
		// step between consecutive deltas, or won't do changes to the document before selection is properly restored.
		this.editor.document.enqueueChanges( () => {
			const lastDelta = item.batch.deltas[ item.batch.deltas.length - 1 ];
			const nextBaseVersion = lastDelta.baseVersion + lastDelta.operations.length;

			// Selection state is from the moment after undo happened. It needs to be transformed by all the deltas
			// that happened after the selection state got saved. Unfortunately it is tricky, because those deltas
			// are already compressed in the history (they are removed).
			// Because of that we will transform the selection only by non-redo deltas
			const deltas = Array.from( this.editor.document.history.getDeltas( nextBaseVersion ) ).filter( ( delta ) => {
				return !this._createdBatches.has( delta.batch );
			} );

			this._restoreSelection( item.selection.ranges, item.selection.isBackward, deltas );
			this._redo( item.batch );
		} );

		this.refreshState();
	}

	/**
	 * Redoes a batch by reversing the batch that has undone it, transforming that batch and applying it. This is
	 * a helper method for {@link undo.RedoCommand#_doExecute}.
	 *
	 * @private
	 * @param {engine.model.Batch} storedBatch The batch whose deltas will be reversed, transformed and applied.
	 */
	_redo( storedBatch ) {
		const document = this.editor.document;

		// All changes done by the command execution will be saved as one batch.
		const redoingBatch = document.batch();
		this._createdBatches.add( redoingBatch );

		const deltasToRedo = storedBatch.deltas.slice();
		deltasToRedo.reverse();

		// We will process each delta from `storedBatch`, in reverse order. If there was deltas A, B and C in stored batch,
		// we need to revert them in reverse order, so first reverse C, then B, then A.
		for ( let deltaToRedo of deltasToRedo ) {
			// Keep in mind that all algorithms return arrays. That's because the transformation might result in multiple
			// deltas, so we need arrays to handle them anyway. To simplify algorithms, it is better to always have arrays
			// in mind. For simplicity reasons, we will use singular form in descriptions and names.

			const nextBaseVersion = deltaToRedo.baseVersion + deltaToRedo.operations.length;

			// As stated above, convert delta to array of deltas.
			let reversedDelta = [ deltaToRedo.getReversed() ];

			// 1. Transform that delta by deltas from history that happened after it.
			// Omit deltas from "redo" batches, because reversed delta already bases on them. Transforming by them
			// again will result in incorrect deltas.
			for ( let historyDelta of document.history.getDeltas( nextBaseVersion ) ) {
				if ( !this._createdBatches.has( historyDelta.batch ) ) {
					reversedDelta = transformDelta( reversedDelta, [ historyDelta ], true );
				}
			}

			// 2. After reversed delta has been transformed by all history deltas, apply it.
			for ( let delta of reversedDelta ) {
				// Fix base version.
				delta.baseVersion = document.version;

				// Before applying, add the delta to the `redoingBatch`.
				redoingBatch.addDelta( delta );

				// Now, apply all operations of the delta.
				for ( let operation of delta.operations ) {
					document.applyOperation( operation );
				}
			}
		}
	}
}
