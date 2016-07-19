/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BaseCommand from './basecommand.js';
import { transformDelta as transformDelta } from './basecommand.js';

/**
 * Undo command stores {@link engine.model.Batch batches} applied to the {@link engine.model.Document document}
 * and is able to undo a batch by reversing it and transforming by other batches from {@link engine.model.Document#history history}
 * that happened after the reversed batch.
 *
 * Undo command also takes care of restoring {@link engine.model.Document#selection selection} to the state before the
 * undone batch was applied.
 *
 * @memberOf undo
 * @extends undo.BaseCommand
 */
export default class UndoCommand extends BaseCommand {
	/**
	 * Executes the command: reverts a {@link engine.model.Batch batch} added to the command's stack, transforms
	 * and applies reverted version on the {@link engine.model.Document document} and removes the batch from the stack.
	 * Then, restores {@link engine.model.Document#selection document selection}.
	 *
	 * @protected
	 * @fires undo.UndoCommand#event:revert
	 * @param {engine.model.Batch} [batch] Batch that should be undone. If not set, the last added batch will be undone.
	 */
	_doExecute( batch = null ) {
		// If batch is not given, set `batchIndex` to the last index in command stack.
		let batchIndex = batch ? this._stack.findIndex( ( a ) => a.batch == batch ) : this._stack.length - 1;

		const item = this._stack.splice( batchIndex, 1 )[ 0 ];

		// All changes has to be done in one `enqueueChanges` callback so other listeners will not
		// step between consecutive deltas, or won't do changes to the document before selection is properly restored.
		this.editor.document.enqueueChanges( () => {
			this._undo( item.batch );
			this._restoreSelection( item.selection.ranges, item.selection.isBackward, item.batch.baseVersion );
		} );

		this.fire( 'revert', item.batch );
		this.refreshState();
	}

	/**
	 * Returns index in {@link undo.BaseCommand#_stack} pointing to the item that is storing a batch that has given
	 * {@link engine.model.Batch#baseVersion}.
	 *
	 * @private
	 * @param {Number} baseVersion Base version of the batch to find.
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
	 * Un-does a batch by reversing a batch from history, transforming that reversed batch and applying it. This is
	 * a helper method for {@link undo.UndoCommand#_doExecute}.
	 *
	 * @private
	 * @param {engine.model.Batch} batchToUndo Batch, which deltas will be reversed, transformed and applied.
	 * @param {engine.model.Batch} undoingBatch Batch that will contain transformed and applied deltas from `batchToUndo`.
	 * @param {engine.model.Document} document Document that is operated on by the command.
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

				// 3.2. Transform history delta by reversed delta. We need this to update document history.
				const updatedHistoryDelta = transformDelta( [ historyDelta ], reversedDelta, false );

				// 3.3. Transform reversed delta by history delta (in state before transformation above).
				reversedDelta = transformDelta( reversedDelta, [ historyDelta ], true );

				// 3.4. Store updated history delta. Later, it will be updated in `history`.
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
	}

	/**
	 * Restores {@link engine.model.Document#selection document selection} state after a batch has been undone. This
	 * is a helper method for {@link undo.UndoCommand#_doExecute}.
	 *
	 * @private
	 * @param {Array.<engine.model.Range>} ranges Ranges to be restored.
	 * @param {Boolean} isBackward Flag describing if restored range was selected forward or backward.
	 * @param {Number} baseVersion
	 * @param {engine.model.Document} document Document that is operated on by the command.
	 */
	_restoreSelection( ranges, isBackward, baseVersion ) {
		const document = this.editor.document;

		// This will keep the transformed selection ranges.
		const selectionRanges = [];

		// Transform all ranges from the restored selection.
		for ( let range of ranges ) {
			const transformedRanges = transformSelectionRange( range, baseVersion, document );

			// For each `range` from `ranges`, we take only one transformed range.
			// This is because we want to prevent situation where single-range selection
			// got transformed to multi-range selection. We will take the first range that
			// is not in the graveyard.
			const transformedRange = transformedRanges.find(
				( range ) => range.start.root != document.graveyard
			);

			// `transformedRange` might be `undefined` if transformed range ended up in graveyard.
			if ( transformedRange ) {
				selectionRanges.push( transformedRange );
			}
		}

		// `selectionRanges` may be empty if all ranges ended up in graveyard. If that is the case, do not restore selection.
		if ( selectionRanges.length ) {
			document.selection.setRanges( selectionRanges, isBackward );
		}
	}
}

// Transforms given range `range` by deltas from `document` history, starting from a delta with given `baseVersion`.
// Returns an array containing one or more ranges, which are result of the transformation.
function transformSelectionRange( range, baseVersion, document ) {
	const history = document.history;

	// We create `transformed` array. At the beginning it will have only the original range.
	// During transformation the original range will change or even break into smaller ranges.
	// After the range is broken into two ranges, we have to transform both of those ranges separately.
	// For that reason, we keep all transformed ranges in one array and operate on it.
	let transformed = [ range ];

	// The ranges will be transformed by history deltas that happened after the selection got stored.
	// Note, that at this point, the document history is already updated by undo command execution. We will
	// not transform the range by deltas that got undone or their reversing counterparts.
	transformed = transformRangesByDeltas( transformed, history.getDeltas( baseVersion ) );

	// After `range` got transformed, we have an array of ranges. Some of those
	// ranges may be "touching" -- they can be next to each other and could be merged.
	// First, we have to sort those ranges because they don't have to be in an order.
	transformed.sort( ( a, b ) => a.start.isBefore( b.start ) ? -1 : 1 );

	// Then, we check if two consecutive ranges are touching.
	for ( let i = 1 ; i < transformed.length; i++ ) {
		let a = transformed[ i - 1 ];
		let b = transformed[ i ];

		if ( a.end.isTouching( b.start ) ) {
			a.end = b.end;
			transformed.splice( i, 1 );
			i--;
		}
	}

	return transformed;
}

// Transforms given set of `ranges` by given set of `deltas`. Returns transformed `ranges`.
function transformRangesByDeltas( ranges, deltas ) {
	for ( let delta of deltas ) {
		for ( let operation of delta.operations ) {
			// We look through all operations from all deltas.

			for ( let i = 0; i < ranges.length; i++ ) {
				// We transform every range by every operation.
				let result;

				switch ( operation.type ) {
					case 'insert':
						result = ranges[ i ].getTransformedByInsertion(
							operation.position,
							operation.nodeList.length,
							true
						);
						break;

					case 'move':
					case 'remove':
					case 'reinsert':
						result = ranges[ i ].getTransformedByMove(
							operation.sourcePosition,
							operation.targetPosition,
							operation.howMany,
							true
						);
						break;
				}

				// If we have a transformation result, we substitute transformed range with it in `transformed` array.
				// Keep in mind that the result is an array and may contain multiple ranges.
				if ( result ) {
					ranges.splice( i, 1, ...result );

					// Fix iterator.
					i = i + result.length - 1;
				}
			}
		}
	}

	return ranges;
}
