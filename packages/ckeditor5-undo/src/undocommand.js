/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module undo/undocommand
 */

import BaseCommand from './basecommand.js';
import { transformRangesByDeltas } from './basecommand.js';
import { transformDeltaSets } from '../engine/model/delta/transform.js';

/**
 * The undo command stores {@link module:engine/model/batch~Batch batches} applied to the
 * {@link module:engine/model/document~Document document} and is able to undo a batch by reversing it and transforming by
 * other batches from {@link module:engine/model/document~Document#history history} that happened after the reversed batch.
 *
 * The undo command also takes care of restoring the {@link module:engine/model/document~Document#selection document selection}
 * to the state before the undone batch was applied.
 *
 * @extends module:undo/basecommand~BaseCommand
 */
export default class UndoCommand extends BaseCommand {
	/**
	 * Executes the command. This method reverts a {@link module:engine/model/batch~Batch batch} added to the command's stack, transforms
	 * and applies the reverted version on the {@link module:engine/model/document~Document document} and removes the batch from the stack.
	 * Then, it restores the {@link module:engine/model/document~Document#selection document selection}.
	 *
	 * @protected
	 * @fires revert
	 * @param {module:engine/model/batch~Batch} [batch] A batch that should be undone. If not set, the last added batch will be undone.
	 */
	_doExecute( batch = null ) {
		// If batch is not given, set `batchIndex` to the last index in command stack.
		let batchIndex = batch ? this._stack.findIndex( ( a ) => a.batch == batch ) : this._stack.length - 1;

		const item = this._stack.splice( batchIndex, 1 )[ 0 ];

		// All changes has to be done in one `enqueueChanges` callback so other listeners will not
		// step between consecutive deltas, or won't do changes to the document before selection is properly restored.
		this.editor.document.enqueueChanges( () => {
			const undoingBatch = this._undo( item.batch );

			const deltas = this.editor.document.history.getDeltas( item.batch.baseVersion );
			this._restoreSelection( item.selection.ranges, item.selection.isBackward, deltas );

			this.fire( 'revert', item.batch, undoingBatch );
		} );

		this.refreshState();
	}

	/**
	 * Returns an index in {@link module:undo/basecommand~BaseCommand#_stack} pointing to the item that is storing a
	 * batch that has a given {@link module:engine/model/batch~Batch#baseVersion}.
	 *
	 * @private
	 * @param {Number} baseVersion The base version of the batch to find.
	 * @returns {Number|null}
	 */
	_getItemIndexFromBaseVersion( baseVersion ) {
		for ( let i = 0; i < this._stack.length; i++ ) {
			if ( this._stack[ i ].batch.baseVersion == baseVersion ) {
				return i;
			}
		}

		return null;
	}

	/**
	 * Undoes a batch by reversing a batch from history, transforming that reversed batch and applying it. This is
	 * a helper method for {@link #_doExecute}.
	 *
	 * @private
	 * @param {module:engine/model/batch~Batch} batchToUndo A batch whose deltas will be reversed, transformed and applied.
	 */
	_undo( batchToUndo ) {
		const document = this.editor.document;

		// All changes done by the command execution will be saved as one batch.
		const undoingBatch = document.batch();
		this._createdBatches.add( undoingBatch );

		const history = document.history;
		const deltasToUndo = batchToUndo.deltas.slice();
		deltasToUndo.reverse();

		// We will process each delta from `batchToUndo`, in reverse order. If there was deltas A, B and C in undone batch,
		// we need to revert them in reverse order, so first reverse C, then B, then A.
		for ( let deltaToUndo of deltasToUndo ) {
			// Keep in mind that all algorithms return arrays. That's because the transformation might result in multiple
			// deltas, so we need arrays to handle them anyway. To simplify algorithms, it is better to always have arrays
			// in mind. For simplicity reasons, we will use singular form in descriptions and names.
			const baseVersion = deltaToUndo.baseVersion;
			const nextBaseVersion = baseVersion + deltaToUndo.operations.length;

			// 1. Get updated version of the delta from the history.
			// Batch stored in the undo command might have an outdated version of the delta that should be undone.
			// To prevent errors, we will take an updated version of it from the history, basing on delta's `baseVersion`.
			const updatedDeltaToUndo = history.getDelta( baseVersion );

			// This is a safe valve in case of not finding delta to undo in history. This may come up if that delta
			// got updated into no deltas, or removed from history.
			if ( updatedDeltaToUndo === null ) {
				continue;
			}

			// 2. Reverse delta from the history.
			updatedDeltaToUndo.reverse();
			let reversedDelta = [];

			for ( let delta of updatedDeltaToUndo ) {
				reversedDelta.push( delta.getReversed() );
			}

			// Stores history deltas transformed by `deltaToUndo`. Will be used later for updating document history.
			const updatedHistoryDeltas = {};

			// 3. Transform reversed delta by history deltas that happened after delta to undo. We have to bring
			// reversed delta to the current state of document. While doing this, we will also update history deltas
			// to the state which "does not remember" delta that we undo.
			for ( let historyDelta of history.getDeltas( nextBaseVersion ) ) {
				// 3.1. Transform selection range stored with history batch by reversed delta.
				// It is important to keep stored selection ranges updated. As we are removing and updating deltas in the history,
				// selection ranges would base on outdated history state.
				const itemIndex = this._getItemIndexFromBaseVersion( historyDelta.baseVersion );

				// `itemIndex` will be `null` for `historyDelta` if it is not the first delta in it's batch.
				// This is fine, because we want to transform each selection only once, before transforming reversed delta
				// by the first delta of the batch connected with the ranges.
				if ( itemIndex !== null ) {
					this._stack[ itemIndex ].selection.ranges = transformRangesByDeltas( this._stack[ itemIndex ].selection.ranges, reversedDelta );
				}

				// 3.2. Transform reversed delta by history delta and vice-versa.
				const results = transformDeltaSets( reversedDelta, [ historyDelta ], true );

				reversedDelta = results.deltasA;
				const updatedHistoryDelta = results.deltasB;

				// 3.3. Store updated history delta. Later, it will be updated in `history`.
				if ( !updatedHistoryDeltas[ historyDelta.baseVersion ] ) {
					updatedHistoryDeltas[ historyDelta.baseVersion ] = [];
				}

				updatedHistoryDeltas[ historyDelta.baseVersion ] = updatedHistoryDeltas[ historyDelta.baseVersion ].concat( updatedHistoryDelta );
			}

			// 4. After reversed delta has been transformed by all history deltas, apply it.
			for ( let delta of reversedDelta ) {
				// Fix base version.
				delta.baseVersion = document.version;

				// Before applying, add the delta to the `undoingBatch`.
				undoingBatch.addDelta( delta );

				// Now, apply all operations of the delta.
				for ( let operation of delta.operations ) {
					document.applyOperation( operation );
				}
			}

			// 5. Remove reversed delta from the history.
			history.removeDelta( baseVersion );

			// And all deltas that are reversing it.
			// So the history looks like both original and reversing deltas never happened.
			// That's why we have to update history deltas - some of them might have been basing on deltas that we are now removing.
			for ( let delta of reversedDelta ) {
				history.removeDelta( delta.baseVersion );
			}

			// 6. Update history deltas in history.
			for ( let historyBaseVersion in updatedHistoryDeltas ) {
				history.updateDelta( Number( historyBaseVersion ), updatedHistoryDeltas[ historyBaseVersion ] );
			}
		}

		return undoingBatch;
	}
}

/**
 * Fired when execution of the command reverts some batch.
 *
 * @event revert
 */
