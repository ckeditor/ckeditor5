/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import UndoCommand from './undocommand.js';
import RedoCommand from './redocommand.js';

/**
 * Undo engine feature.
 *
 * Undo brings in possibility to undo and redo changes done in the model by deltas through
 * the {@link engine.model.Document#batch Batch API}.
 *
 * @memberOf undo
 * @extends ckeditor5.Feature
 */
export default class UndoEngine extends Feature {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * Command which manages undo {@link engine.model.Batch batches} stack (history).
		 * Created and registered during {@link undo.UndoEngine#init feature initialization}.
		 *
		 * @private
		 * @member {undo.UndoEngineCommand} undo.UndoEngine#_undoCommand
		 */

		/**
		 * Command which manages redo {@link engine.model.Batch batches} stack (history).
		 * Created and registered during {@link undo.UndoEngine#init feature initialization}.
		 *
		 * @private
		 * @member {undo.UndoEngineCommand} undo.UndoEngine#_redoCommand
		 */

		/**
		 * Keeps track of which batch has been registered in Undo.
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
			if ( !batch || this._batchRegistry.has( batch ) || batch.type == 'ignore' ) {
				return;
			}

			if ( batch.type == 'undo' ) {
				// If this batch comes from `undoCommand`, add it to `redoCommand` stack.
				this._redoCommand.addBatch( batch );
			} else if ( batch.type == 'redo' ) {
				// If this batch comes from `redoCommand`, add it to `undoCommand` stack.
				this._undoCommand.addBatch( batch );
			} else {
				// Any other batch - these are new changes in the document.
				// Add them to `undoCommand` stack and clear `redoCommand` stack.
				this._undoCommand.addBatch( batch );
				this._redoCommand.clearStack();
			}

			// Add the batch to the registry so it will not be processed again.
			this._batchRegistry.add( batch );
		} );
	}
}
