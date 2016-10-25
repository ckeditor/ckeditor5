/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Feature from '../core/feature.js';
import UndoCommand from './undocommand.js';
import RedoCommand from './redocommand.js';

/**
 * The undo engine feature.
 *
 * Undo brings in possibility to undo and redo changes done in the model by deltas through
 * the {@link engine.model.Document#batch Batch API}.
 *
 * @memberOf undo
 * @extends core.Feature
 */
export default class UndoEngine extends Feature {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * The command that manages undo {@link engine.model.Batch batches} stack (history).
		 * Created and registered during the {@link undo.UndoEngine#init feature initialization}.
		 *
		 * @private
		 * @member {undo.UndoEngineCommand} undo.UndoEngine#_undoCommand
		 */

		/**
		 * The command that manages redo {@link engine.model.Batch batches} stack (history).
		 * Created and registered during the {@link undo.UndoEngine#init feature initialization}.
		 *
		 * @private
		 * @member {undo.UndoEngineCommand} undo.UndoEngine#_redoCommand
		 */

		/**
		 * Keeps track of which batches were registered in undo.
		 *
		 * @private
		 * @member {WeakSet.<engine.model.Batch>} undo.UndoEngine#_batchRegistry
		 */
		this._batchRegistry = new WeakSet();
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Create commands.
		this._undoCommand = new UndoCommand( this.editor );
		this._redoCommand = new RedoCommand( this.editor );

		// Register command to the editor.
		this.editor.commands.set( 'undo', this._undoCommand );
		this.editor.commands.set( 'redo', this._redoCommand );

		this.listenTo( this.editor.document, 'change', ( evt, type, changes, batch ) => {
			// If changes are not a part of a batch or this is not a new batch, omit those changes.
			if ( this._batchRegistry.has( batch ) || batch.type == 'transparent' ) {
				return;
			} else {
				if ( this._redoCommand._createdBatches.has( batch ) ) {
					// If this batch comes from `redoCommand`, add it to `undoCommand` stack.
					this._undoCommand.addBatch( batch );
				} else if ( !this._undoCommand._createdBatches.has( batch ) ) {
					// A default batch - these are new changes in the document, not introduced by undo feature.
					// Add them to `undoCommand` stack and clear `redoCommand` stack.
					this._undoCommand.addBatch( batch );
					this._redoCommand.clearStack();
				}
			}

			// Add the batch to the registry so it will not be processed again.
			this._batchRegistry.add( batch );
		}, { priority: 'highest' } );

		this.listenTo( this._undoCommand, 'revert', ( evt, undoneBatch, undoingBatch ) => {
			this._redoCommand.addBatch( undoingBatch );
		} );
	}
}
