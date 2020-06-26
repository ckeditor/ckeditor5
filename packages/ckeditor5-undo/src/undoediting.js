/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
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

		editor.config.define( 'undo.elementsWithSeparateSelectionRanges', [] );
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
			const isRegisteredBatch = this._batchRegistry.has( batch );

			// If changes are not a part of a batch or this is not a new batch, omit those changes.
			if ( isRegisteredBatch || ( batch.type == 'transparent' && !isRedoBatch && !isUndoBatch ) ) {
				return;
			} else {
				if ( isRedoBatch ) {
					// If this batch comes from `redoCommand`, add it to `undoCommand` stack.
					this._undoCommand.addBatch( batch );
				} else if ( !isUndoBatch ) {
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

		editor.keystrokes.set( 'CTRL+Z', 'undo' );
		editor.keystrokes.set( 'CTRL+Y', 'redo' );
		editor.keystrokes.set( 'CTRL+SHIFT+Z', 'redo' );
	}
}
