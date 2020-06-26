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

		// Transform all ranges from the restored selection.
		const selectionRanges = ranges
			.flatMap( range => range.getTransformedByOperations( operations ) )
			.filter( range => range.root != document.graveyard )
			.sort( ( a, b ) => a.start.isBefore( b.start ) ? -1 : 1 );

		normalizeRanges( selectionRanges );
		normalizeRanges( selectionRanges, [ 'tableCell' ] );

		// @if CK_DEBUG_ENGINE // console.log( `Restored selection from undo: ${ selectionRanges.join( ', ' ) }` );

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

function normalizeRanges( ranges, dontSumElements = null ) {
	for ( let i = 1; i < ranges.length; i++ ) {
		const previousRange = ranges[ i - 1 ];
		const containedElement = dontSumElements && previousRange.getContainedElement();

		if ( containedElement && dontSumElements.includes( containedElement.name ) ) {
			continue;
		}

		const summedRange = previousRange.getSum( ranges[ i ], !!dontSumElements );

		if ( summedRange ) {
			ranges.splice( --i, 2, summedRange );
		}
	}
}
