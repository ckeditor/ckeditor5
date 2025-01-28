/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module undo/basecommand
 */

import { Command, type Editor } from '@ckeditor/ckeditor5-core';

import {
	transformSets,
	type Batch,
	type Operation,
	type DataControllerSetEvent,
	type Range,
	NoOperation
} from '@ckeditor/ckeditor5-engine';

/**
 * Base class for the undo feature commands: {@link module:undo/undocommand~UndoCommand} and {@link module:undo/redocommand~RedoCommand}.
 */
export default abstract class BaseCommand extends Command {
	/**
	 * Stack of items stored by the command. These are pairs of:
	 *
	 * * {@link module:engine/model/batch~Batch batch} saved by the command,
	 * * {@link module:engine/model/selection~Selection selection} state at the moment of saving the batch.
	 */
	protected _stack: Array<{ batch: Batch; selection: { ranges: Array<Range>; isBackward: boolean } }> = [];

	/**
	 * Stores all batches that were created by this command.
	 *
	 * @internal
	 */
	public _createdBatches = new WeakSet<Batch>();

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		// Refresh state, so the command is inactive right after initialization.
		this.refresh();

		// This command should not depend on selection change.
		this._isEnabledBasedOnSelection = false;

		// Set the transparent batch for the `editor.data.set()` call if the
		// batch type is not set already.
		this.listenTo<DataControllerSetEvent>( editor.data, 'set', ( evt, data ) => {
			// Create a shallow copy of the options to not change the original args.
			// And make sure that an object is assigned to data[ 1 ].
			data[ 1 ] = { ...data[ 1 ] };

			const options = data[ 1 ];

			// If batch type is not set, default to non-undoable batch.
			if ( !options.batchType ) {
				options.batchType = { isUndoable: false };
			}
		}, { priority: 'high' } );

		// Clear the stack for the `transparent` batches.
		this.listenTo<DataControllerSetEvent>( editor.data, 'set', ( evt, data ) => {
			// We can assume that the object exists and it has a `batchType` property.
			// It was ensured with a higher priority listener before.
			const options = data[ 1 ]!;

			if ( !options.batchType!.isUndoable ) {
				this.clearStack();
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		this.isEnabled = this._stack.length > 0;
	}

	/**
	 * Returns all batches created by this command.
	 */
	public get createdBatches(): WeakSet<Batch> {
		return this._createdBatches;
	}

	/**
	 * Stores a batch in the command, together with the selection state of the {@link module:engine/model/document~Document document}
	 * created by the editor which this command is registered to.
	 *
	 * @param batch The batch to add.
	 */
	public addBatch( batch: Batch ): void {
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
	public clearStack(): void {
		this._stack = [];
		this.refresh();
	}

	/**
	 * Restores the {@link module:engine/model/document~Document#selection document selection} state after a batch was undone.
	 *
	 * @param ranges Ranges to be restored.
	 * @param isBackward A flag describing whether the restored range was selected forward or backward.
	 * @param operations Operations which has been applied since selection has been stored.
	 */
	protected _restoreSelection(
		ranges: Array<Range>,
		isBackward: boolean,
		operations: Array<Operation>
	): void {
		const model = this.editor.model;
		const document = model.document;

		// This will keep the transformed selection ranges.
		const selectionRanges: Array<Range> = [];

		// Transform all ranges from the restored selection.
		const transformedRangeGroups = ranges.map( range => range.getTransformedByOperations( operations ) );
		const allRanges = transformedRangeGroups.flat();

		for ( const rangeGroup of transformedRangeGroups ) {
			// While transforming there could appear ranges that are contained by other ranges, we shall ignore them.
			const transformed = rangeGroup
				.filter( range => range.root != document.graveyard )
				.filter( range => !isRangeContainedByAnyOtherRange( range, allRanges ) );

			// All the transformed ranges ended up in graveyard.
			if ( !transformed.length ) {
				continue;
			}

			// After the range got transformed, we have an array of ranges. Some of those
			// ranges may be "touching" -- they can be next to each other and could be merged.
			normalizeRanges( transformed );

			// For each `range` from `ranges`, we take only one transformed range.
			// This is because we want to prevent situation where single-range selection
			// got transformed to multi-range selection.
			selectionRanges.push( transformed[ 0 ] );
		}

		// @if CK_DEBUG_ENGINE // console.log( `Restored selection by undo: ${ selectionRanges.join( ', ' ) }` );

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
	 * @param batchToUndo The batch to be undone.
	 * @param undoingBatch The batch that will contain undoing changes.
	 */
	protected _undo( batchToUndo: Batch, undoingBatch: Batch ): void {
		const model = this.editor.model;
		const document = model.document;

		// All changes done by the command execution will be saved as one batch.
		this._createdBatches.add( undoingBatch );

		const operationsToUndo = batchToUndo.operations.slice().filter( operation => operation.isDocumentOperation );
		operationsToUndo.reverse();

		// We will process each operation from `batchToUndo`, in reverse order. If there were operations A, B and C in undone batch,
		// we need to revert them in reverse order, so first C' (reversed C), then B', then A'.
		for ( const operationToUndo of operationsToUndo ) {
			const nextBaseVersion = operationToUndo.baseVersion! + 1;
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
			for ( let operation of reversedOperations ) {
				// Do not apply any operation on non-editable space.
				const affectedSelectable = operation.affectedSelectable;

				if ( affectedSelectable && !model.canEditAt( affectedSelectable ) ) {
					operation = new NoOperation( operation.baseVersion );
				}

				// Before applying, add the operation to the `undoingBatch`.
				undoingBatch.addOperation( operation );
				model.applyOperation( operation );

				document.history.setOperationAsUndone( operationToUndo, operation );
			}
		}
	}
}

/**
 * Normalizes list of ranges by joining intersecting or "touching" ranges.
 *
 * @param ranges Ranges to be normalized.
 */
function normalizeRanges( ranges: Array<Range> ): void {
	ranges.sort( ( a, b ) => a.start.isBefore( b.start ) ? -1 : 1 );

	for ( let i = 1; i < ranges.length; i++ ) {
		const previousRange = ranges[ i - 1 ];
		const joinedRange = previousRange.getJoined( ranges[ i ], true );

		if ( joinedRange ) {
			// Replace the ranges on the list with the new joined range.
			i--;
			ranges.splice( i, 2, joinedRange );
		}
	}
}

function isRangeContainedByAnyOtherRange( range: Range, ranges: Array<Range> ): boolean {
	return ranges.some( otherRange => otherRange !== range && otherRange.containsRange( range, true ) );
}
