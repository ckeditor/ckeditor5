/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Command from '../command/command.js';

/**
 * Undo command stores batches in itself and is able to and apply reverted versions of them on the document.
 *
 * undo.UndoCommand
 */
export default class UndoCommand extends Command {
	/**
	 * @see core.command.Command
	 * @param {core.Editor} editor
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * Batches which are saved by the command. They can be reversed.
		 *
		 * @private
		 * @member {Array.<core.treeModel.Batch>} core.command.UndoCommand#_batchStack
		 */
		this._batchStack = [];
	}

	/**
	 * Stores a batch in the command. Stored batches can be then reverted.
	 *
	 * @param {core.teeModel.Batch} batch Batch to add.
	 */
	addBatch( batch ) {
		this._batchStack.push( batch );
	}

	/**
	 * Removes all batches from the stack.
	 */
	clearStack() {
		this._batchStack = [];
	}

	/**
	 * Checks whether this command should be enabled. Command is enabled when it has any batches in its stack.
	 *
	 * @private
	 * @returns {Boolean}
	 */
	_checkEnabled() {
		return this._batchStack.length > 0;
	}

	/**
	 * Executes the command: reverts a {@link core.treeModel.Batch batch} added to the command's stack,
	 * applies it on the document and removes the batch from the stack.
	 *
	 * Fires `undo` event with reverted batch as a parameter.
	 *
	 * @private
	 * @param {Number} [batchIndex] If set, batch under the given index on the stack will be reverted and removed.
	 * If not set, or invalid, the last added batch will be reverted and removed.
	 */
	_doExecute( batchIndex ) {
		batchIndex = this._batchStack[ batchIndex ] ? batchIndex : this._batchStack.length - 1;

		const undoBatch = this._batchStack.splice( batchIndex, 1 )[ 0 ];
		const undoDeltas = undoBatch.deltas.slice();

		undoDeltas.reverse();

		for ( let undoDelta of undoDeltas ) {
			const undoDeltaReversed = undoDelta.getReversed();
			const updatedDeltas = this.editor.document.history.updateDelta( undoDeltaReversed );

			for ( let delta of updatedDeltas ) {
				for ( let operation of delta.operations ) {
					this.editor.document.applyOperation( operation );
				}
			}
		}

		this.fire( 'undo', undoBatch );
	}
}
