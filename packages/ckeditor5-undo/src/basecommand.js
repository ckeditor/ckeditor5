/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module undo/basecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { transformSets } from '@ckeditor/ckeditor5-engine/src/model/operation/transform';

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
		const docSelection = this.editor.model.document.selection;

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
	 * @param {Array.<module:engine/model/operation/operation~Operation>} operations Operations which has been applied
	 * since selection has been stored.
	 */
	_restoreSelection( ranges, isBackward, operations ) {
		const model = this.editor.model;
		const document = model.document;

		// This will keep the transformed selection ranges.
		const selectionRanges = [];

		// Transform all ranges from the restored selection.
		for ( const range of ranges ) {
			const transformed = transformSelectionRange( range, operations );

			// For each `range` from `ranges`, we take only one transformed range.
			// This is because we want to prevent situation where single-range selection
			// got transformed to multi-range selection. We will take the first range that
			// is not in the graveyard.
			const newRange = transformed.find(
				range => range.start.root != document.graveyard
			);

			// `transformedRange` might be `undefined` if transformed range ended up in graveyard.
			if ( newRange ) {
				selectionRanges.push( newRange );
			}
		}

		// `selectionRanges` may be empty if all ranges ended up in graveyard. If that is the case, do not restore selection.
		if ( selectionRanges.length ) {
			model.change( writer => {
				writer.setSelection( selectionRanges, { backward: isBackward } );
			} );
		}
	}

	/**
	 * Undoes a batch by reversing that batch, transforming reversed batch and finally applying it.
	 * This is a helper method for {@link #execute}.
	 *
	 * @protected
	 * @param {module:engine/model/batch~Batch} batchToUndo The batch to be undone.
	 * @param {module:engine/model/batch~Batch} undoingBatch The batch that will contain undoing changes.
	 */
	_undo( batchToUndo, undoingBatch ) {
		const model = this.editor.model;
		const document = model.document;

		// All changes done by the command execution will be saved as one batch.
		this._createdBatches.add( undoingBatch );

		const operationsToUndo = batchToUndo.operations.slice().filter( operation => operation.isDocumentOperation );
		operationsToUndo.reverse();

		// We will process each operation from `batchToUndo`, in reverse order. If there were operations A, B and C in undone batch,
		// we need to revert them in reverse order, so first C' (reversed C), then B', then A'.
		for ( const operationToUndo of operationsToUndo ) {
			const nextBaseVersion = operationToUndo.baseVersion + 1;
			const historyOperations = Array.from( document.history.getOperations( nextBaseVersion ) );

			const transformedSets = transformSets(
				[ operationToUndo.getReversed() ],
				historyOperations,
				{
					useRelations: true,
					document: this.editor.model.document,
					padWithNoOps: false,
					forceWeakRemove: true
				}
			);

			const reversedOperations = transformedSets.operationsA;

			// After reversed operation has been transformed by all history operations, apply it.
			for ( const operation of reversedOperations ) {
				// Before applying, add the operation to the `undoingBatch`.
				undoingBatch.addOperation( operation );
				model.applyOperation( operation );

				document.history.setOperationAsUndone( operationToUndo, operation );
			}
		}
	}
}

// Transforms given range `range` by given `operations`.
// Returns an array containing one or more ranges, which are result of the transformation.
function transformSelectionRange( range, operations ) {
	const transformed = range.getTransformedByOperations( operations );

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
