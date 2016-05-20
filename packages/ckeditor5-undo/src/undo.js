/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Feature from '../feature.js';
import UndoCommand from './undocommand.js';

/**
 * Undo feature.
 *
 * Undo features brings in possibility to undo and re-do changes done in Tree Model by deltas through Batch API.
 *
 * @memberOf undo
 */
export default class Undo extends Feature {
	constructor( editor ) {
		super( editor );

		/**
		 * Undo command which manages undo {@link engine.model.Batch batches} stack (history).
		 * Created and registered during {@link undo.Undo#init feature initialization}.
		 *
		 * @private
		 * @member {undo.UndoCommand} undo.Undo#_undoCommand
		 */
		this._undoCommand = null;

		/**
		 * Undo command which manages redo {@link engine.model.Batch batches} stack (history).
		 * Created and registered during {@link undo.Undo#init feature initialization}.
		 *
		 * @private
		 * @member {undo.UndoCommand} undo.Undo#_redoCommand
		 */
		this._redoCommand = null;

		/**
		 * Keeps track of which batch has already been added to undo manager.
		 *
		 * @private
		 * @member {WeakSet.<engine.model.Batch>} undo.Undo#_batchRegistry
		 */
		this._batchRegistry = new WeakSet();
	}

	/**
	 * @inheritDoc
	 */
	init() {
		// Create commands.
		this._redoCommand = new UndoCommand( this.editor );
		this._undoCommand = new UndoCommand( this.editor );

		// Register command to the editor.
		this.editor.commands.set( 'redo', this._redoCommand );
		this.editor.commands.set( 'undo', this._undoCommand );

		this.listenTo( this.editor.document, 'change', ( evt, type, changes, batch ) => {
			// Whenever a new batch is created add it to the undo history and clear redo history.
			if ( batch && !this._batchRegistry.has( batch ) ) {
				this._batchRegistry.add( batch );
				this._undoCommand.addBatch( batch );
				this._redoCommand.clearStack();
			}
		} );

		// Whenever batch is reverted by undo command, add it to redo history.
		this.listenTo( this._redoCommand, 'revert', ( evt, batch ) => {
			this._undoCommand.addBatch( batch );
		} );

		// Whenever batch is reverted by redo command, add it to undo history.
		this.listenTo( this._undoCommand, 'revert', ( evt, batch ) => {
			this._redoCommand.addBatch( batch );
		} );
	}
}
