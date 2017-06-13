/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module undo/undoengine
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import UndoCommand from './undocommand';
import RedoCommand from './redocommand';

/**
 * The undo engine feature.
 *
 * Undo brings in possibility to undo and redo changes done in the model by deltas through
 * the {@link module:engine/model/document~Document#batch Batch API}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class UndoEngine extends Plugin {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * The command that manages undo {@link module:engine/model/batch~Batch batches} stack (history).
		 * Created and registered during the {@link #init feature initialization}.
		 *
		 * @private
		 * @member {undo.UndoEngineCommand} #_undoCommand
		 */

		/**
		 * The command that manages redo {@link module:engine/model/batch~Batch batches} stack (history).
		 * Created and registered during the {@link #init feature initialization}.
		 *
		 * @private
		 * @member {undo.UndoEngineCommand} #_redoCommand
		 */

		/**
		 * Keeps track of which batches were registered in undo.
		 *
		 * @private
		 * @member {WeakSet.<module:engine/model/batch~Batch>}
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
		this.editor.commands.add( 'undo', this._undoCommand );
		this.editor.commands.add( 'redo', this._redoCommand );

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
