/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module undo/basecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * Base class for undo feature commands: {@link module:undo/undocommand~UndoCommand} and {@link module:undo/redocommand~RedoCommand}.
 *
 * @protected
 * @extends module:core/command~Command
 */
export default class BaseCommand extends Command {
	constructor( editor ) {
		super( editor );

		/**
		 * Stack of items stored by the command. These are pairs of:
		 *
		 * * {@link module:engine/model/batch~Batch batch} saved by the command,
		 * * {@link module:engine/model/selection~Selection selection} state at the moment of saving the batch.
		 *
		 * @protected
		 * @member {Array} #_stack
		 */
		this._stack = [];

		/**
		 * Stores all batches that were created by this command.
		 *
		 * @protected
		 * @member {WeakSet.<module:engine/model/batch~Batch>} #_createdBatches
		 */
		this._createdBatches = new WeakSet();

		// Refresh state, so the command is inactive right after initialization.
		this.refresh();
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this._stack.length > 0;
	}

	/**
	 * Stores a batch in the command, together with the selection state of the {@link module:engine/model/document~Document document}
	 * created by the editor which this command is registered to.
	 *
	 * @param {module:engine/model/batch~Batch} batch The batch to add.
	 */
	addBatch( batch ) {
		const docSelection = this.editor.document.selection;

		const selection = {
			ranges: docSelection.hasOwnRange ? Array.from( docSelection.getRanges() ) : [],
			isBackward: docSelection.isBackward
		};

		this._stack.push( { batch, selection } );
		this.refresh();
	}

	/**
	 * Removes all items from the stack.
	 */
	clearStack() {
		this._stack = [];
		this.refresh();
	}

	/**
	 * Restores the {@link module:engine/model/document~Document#selection document selection} state after a batch was undone.
	 *
	 * @protected
	 * @param {Array.<module:engine/model/range~Range>} ranges Ranges to be restored.
	 * @param {Boolean} isBackward A flag describing whether the restored range was selected forward or backward.
	 * @param {Array.<module:engine/model/delta/delta~Delta>} deltas Deltas which has been applied since selection has been stored.
	 */
	_restoreSelection( ranges, isBackward, deltas ) {
		const document = this.editor.document;

		// This will keep the transformed selection ranges.
		const selectionRanges = [];

		// Transform all ranges from the restored selection.
		for ( const range of ranges ) {
			const transformedRanges = transformSelectionRange( range, deltas );

			// For each `range` from `ranges`, we take only one transformed range.
			// This is because we want to prevent situation where single-range selection
			// got transformed to multi-range selection. We will take the first range that
			// is not in the graveyard.
			const transformedRange = transformedRanges.find(
				range => range.start.root != document.graveyard
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

	/**
	 * Undoes a batch by reversing that batch, transforming reversed batch and finally applying it.
	 * This is a helper method for {@link #execute}.
	 *
	 * @protected
	 * @param {module:engine/model/batch~Batch} batchToUndo The batch to be undone.
	 */
	_undo( batchToUndo ) {
		const document = this.editor.document;

		// All changes done by the command execution will be saved as one batch.
		const undoingBatch = document.batch();
		this._createdBatches.add( undoingBatch );

		const deltasToUndo = batchToUndo.deltas.slice();
		deltasToUndo.reverse();

		// We will process each delta from `batchToUndo`, in reverse order. If there were deltas A, B and C in undone batch,
		// we need to revert them in reverse order, so first C' (reversed C), then B', then A'.
		for ( const deltaToUndo of deltasToUndo ) {
			// Keep in mind that transformation algorithms return arrays. That's because the transformation might result in multiple
			// deltas, so we need arrays to handle them. To simplify algorithms, it is better to always operate on arrays.
			const nextBaseVersion = deltaToUndo.baseVersion + deltaToUndo.operations.length;

			// Reverse delta from the history.
			const historyDeltas = Array.from( document.history.getDeltas( nextBaseVersion ) );
			const transformedSets = document.transformDeltas( [ deltaToUndo.getReversed() ], historyDeltas, true );
			const reversedDeltas = transformedSets.deltasA;

			// After reversed delta has been transformed by all history deltas, apply it.
			for ( const delta of reversedDeltas ) {
				// Fix base version.
				delta.baseVersion = document.version;

				// Before applying, add the delta to the `undoingBatch`.
				undoingBatch.addDelta( delta );

				// Now, apply all operations of the delta.
				for ( const operation of delta.operations ) {
					document.applyOperation( operation );
				}

				document.history.setDeltaAsUndone( deltaToUndo, delta );
			}
		}

		return undoingBatch;
	}
}

// Transforms given range `range` by given `deltas`.
// Returns an array containing one or more ranges, which are result of the transformation.
function transformSelectionRange( range, deltas ) {
	const transformed = transformRangesByDeltas( [ range ], deltas );

	// After `range` got transformed, we have an array of ranges. Some of those
	// ranges may be "touching" -- they can be next to each other and could be merged.
	// First, we have to sort those ranges to assure that they are in order.
	transformed.sort( ( a, b ) => a.start.isBefore( b.start ) ? -1 : 1 );

	// Then, we check if two consecutive ranges are touching.
	for ( let i = 1; i < transformed.length; i++ ) {
		const a = transformed[ i - 1 ];
		const b = transformed[ i ];

		if ( a.end.isTouching( b.start ) ) {
			// And join them together if they are.
			a.end = b.end;
			transformed.splice( i, 1 );
			i--;
		}
	}

	return transformed;
}

// Transforms given set of `ranges` by given set of `deltas`. Returns transformed `ranges`.
export function transformRangesByDeltas( ranges, deltas ) {
	for ( const delta of deltas ) {
		for ( const operation of delta.operations ) {
			// We look through all operations from all deltas.

			for ( let i = 0; i < ranges.length; i++ ) {
				// We transform every range by every operation.
				let result;

				switch ( operation.type ) {
					case 'insert':
						result = ranges[ i ]._getTransformedByInsertion(
							operation.position,
							operation.nodes.maxOffset,
							true
						);
						break;

					case 'move':
					case 'remove':
					case 'reinsert':
						result = ranges[ i ]._getTransformedByMove(
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
