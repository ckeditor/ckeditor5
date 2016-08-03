/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Command from '../core/command/command.js';
import transform from '../engine/model/delta/transform.js';

/**
 * Base class for undo feature commands: {@link undo.UndoCommand} and {@link undo.RedoCommand}.
 *
 * @protected
 * @memberOf undo
 */
export default class BaseCommand extends Command {
	constructor( editor ) {
		super( editor );

		/**
		 * Stack of items stored by the command. These are pairs of:
		 *
		 * * {@link engine.model.Batch batch} saved by the command and,
		 * * {@link engine.model.Selection selection} state at the moment of saving the batch.
		 *
		 * @protected
		 * @member {Array} undo.BaseCommand#_stack
		 */
		this._stack = [];

		/**
		 * Stores all batches that were created by this command.
		 *
		 * @protected
		 * @member {WeakSet.<engine.model.Batch>} undo.BaseCommand#_createdBatches
		 */
		this._createdBatches = new WeakSet();

		// Refresh state, so command is inactive just after initialization.
		this.refreshState();
	}

	/**
	 * Stores a batch in the command, together with the selection state of the {@link engine.model.Document document}
	 * created by the editor which this command is registered to.
	 *
	 * @param {engine.model.Batch} batch Batch to add.
	 */
	addBatch( batch ) {
		const selection = {
			ranges: Array.from( this.editor.document.selection.getRanges() ),
			isBackward: this.editor.document.selection.isBackward
		};

		this._stack.push( { batch, selection } );
		this.refreshState();
	}

	/**
	 * Removes all items from the stack.
	 */
	clearStack() {
		this._stack = [];
		this.refreshState();
	}

	/**
	 * @inheritDoc
	 */
	_checkEnabled() {
		return this._stack.length > 0;
	}
}

// Performs a transformation of delta set `setToTransform` by given delta set `setToTransformBy`.
// If `setToTransform` deltas are more important than `setToTransformBy` deltas, `isStrong` should be true.
export function transformDelta( setToTransform, setToTransformBy, isStrong = false ) {
	let results = [];

	for ( let toTransform of setToTransform ) {
		let to = [ toTransform ];

		for ( let t = 0; t < to.length; t++ ) {
			for ( let transformBy of setToTransformBy ) {
				let transformed = transform( to[ t ], transformBy, isStrong );
				to.splice( t, 1, ...transformed );
				t = t - 1 + transformed.length;
			}
		}

		results = results.concat( to );
	}

	return results;
}
