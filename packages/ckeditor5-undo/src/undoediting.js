/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module undo/undoediting
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import UndoCommand from './undocommand';
import RedoCommand from './redocommand';

/**
 * The undo engine feature.
 *
 * It introduces the `'undo'` and `'redo'` commands to the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class UndoEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'UndoEditing';
	}

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
		 * @member {module:undo/undocommand~UndoCommand} #_undoCommand
		 */

		/**
		 * The command that manages redo {@link module:engine/model/batch~Batch batches} stack (history).
		 * Created and registered during the {@link #init feature initialization}.
		 *
		 * @private
		 * @member {module:undo/undocommand~UndoCommand} #_redoCommand
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
		const editor = this.editor;

		// Create commands.
		this._undoCommand = new UndoCommand( editor );
		this._redoCommand = new RedoCommand( editor );

		// Register command to the editor.
		editor.commands.add( 'undo', this._undoCommand );
		editor.commands.add( 'redo', this._redoCommand );

		this.listenTo( editor.model, 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			// Do not register batch if the operation is not a document operation.
			// This prevents from creating empty undo steps, where all operations where non-document operations.
			// Non-document operations creates and alters content in detached tree fragments (for example, document fragments).
			// Most of time this is preparing data before it is inserted into actual tree (for example during copy & paste).
			// Such operations should not be reversed.
			if ( !operation.isDocumentOperation ) {
				return;
			}

			const batch = operation.batch;

			const isRedoBatch = this._redoCommand._createdBatches.has( batch );
			const isUndoBatch = this._undoCommand._createdBatches.has( batch );
			const wasProcessed = this._batchRegistry.has( batch );

			// Skip the batch if it was already processed.
			if ( wasProcessed ) {
				return;
			}

			// Add the batch to the registry so it will not be processed again.
			this._batchRegistry.add( batch );

			if ( !batch.isUndoable ) {
				return;
			}

			if ( isRedoBatch ) {
				// If this batch comes from `redoCommand`, add it to `undoCommand` stack.
				this._undoCommand.addBatch( batch );
			} else if ( !isUndoBatch ) {
				// If the batch neither comes from `redoCommand` or `undoCommand` then this is a new, regular batch.
				// Add the batch to the `undoCommand` stack and clear `redoCommand` stack.
				this._undoCommand.addBatch( batch );
				this._redoCommand.clearStack();
			}
		}, { priority: 'highest' } );

		this.listenTo( this._undoCommand, 'revert', ( evt, undoneBatch, undoingBatch ) => {
			this._redoCommand.addBatch( undoingBatch );
		} );

		editor.keystrokes.set( 'CTRL+Z', 'undo' );
		editor.keystrokes.set( 'CTRL+Y', 'redo' );
		editor.keystrokes.set( 'CTRL+SHIFT+Z', 'redo' );
	}
}
