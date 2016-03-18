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
 */
export default class UndoFeature extends Feature {
	constructor( editor ) {
		super( editor );

		/**
		 * Undo command which manages undo {@link core.treeModel.Batch batches} stack (history).
		 * Created and registered during {@link undo.UndoFeature#init feature initialization}.
		 *
		 * @private
		 * @member {undo.UndoCommand} undo.UndoFeature#_undoCommand
		 */
		this._undoCommand = null;

		/**
		 * Undo command which manages redo {@link core.treeModel.Batch batches} stack (history).
		 * Created and registered during {@link undo.UndoFeature#init feature initialization}.
		 *
		 * @private
		 * @member {undo.UndoCommand} undo.UndoFeature#_redoCommand
		 */
		this._redoCommand = null;
	}

	/**
	 * Initializes undo feature.
	 */
	init() {
		// Create commands.
		this._redoCommand = new UndoCommand( this.editor );
		this._undoCommand = new UndoCommand( this.editor );

		// Register command to the editor.
		this.editor.commands.set( 'redo', this._redoCommand );
		this.editor.commands.set( 'undo', this._undoCommand );

		// Whenever new batch is created add it to undo history and clear redo history.
		this.listenTo( this.editor.document, 'batch', ( evt, batch ) => {
			this._undoCommand.addBatch( batch );
			this._redoCommand.clearStack();
		} );

		// Whenever batch is reverted by undo command, add it to redo history.
		this._undoCommand.listenTo( this._redoCommand, 'undo', ( evt, batch ) => {
			this._undoCommand.addBatch( batch );
		} );

		// Whenever batch is reverted by redo command, add it to undo history.
		this._redoCommand.listenTo( this._undoCommand, 'undo', ( evt, batch ) => {
			this._redoCommand.addBatch( batch );
		} );
	}

	destroy() {
		this.stopListening();
	}
}
