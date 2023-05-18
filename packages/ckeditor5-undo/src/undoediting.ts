/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module undo/undoediting
 */

import { Plugin, type Editor } from '@ckeditor/ckeditor5-core';

import UndoCommand, { type UndoCommandRevertEvent } from './undocommand';
import RedoCommand from './redocommand';

import type {
	Batch,
	ModelApplyOperationEvent
} from '@ckeditor/ckeditor5-engine';

/**
 * The undo engine feature.
 *
 * It introduces the `'undo'` and `'redo'` commands to the editor.
 */
export default class UndoEditing extends Plugin {
	/**
	 * The command that manages the undo {@link module:engine/model/batch~Batch batches} stack (history).
	 * Created and registered during the {@link #init feature initialization}.
	 */
	private _undoCommand!: UndoCommand;

	/**
	 * The command that manages the redo {@link module:engine/model/batch~Batch batches} stack (history).
	 * Created and registered during the {@link #init feature initialization}.
	 */
	private _redoCommand!: RedoCommand;

	/**
	 * Keeps track of which batches were registered in undo.
	 */
	private _batchRegistry = new WeakSet<Batch>();

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'UndoEditing' {
		return 'UndoEditing';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;

		// Create commands.
		this._undoCommand = new UndoCommand( editor );
		this._redoCommand = new RedoCommand( editor );

		// Register command to the editor.
		editor.commands.add( 'undo', this._undoCommand );
		editor.commands.add( 'redo', this._redoCommand );

		this.listenTo<ModelApplyOperationEvent>( editor.model, 'applyOperation', ( evt, args ) => {
			const operation = args[ 0 ];

			// Do not register batch if the operation is not a document operation.
			// This prevents from creating empty undo steps, where all operations where non-document operations.
			// Non-document operations creates and alters content in detached tree fragments (for example, document fragments).
			// Most of time this is preparing data before it is inserted into actual tree (for example during copy & paste).
			// Such operations should not be reversed.
			if ( !operation.isDocumentOperation ) {
				return;
			}

			const batch = operation.batch!;

			const isRedoBatch = this._redoCommand.createdBatches.has( batch );
			const isUndoBatch = this._undoCommand.createdBatches.has( batch );
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
				// If this batch comes from `redoCommand`, add it to the `undoCommand` stack.
				this._undoCommand.addBatch( batch );
			} else if ( !isUndoBatch ) {
				// If the batch comes neither  from `redoCommand` nor from `undoCommand` then it is a new, regular batch.
				// Add the batch to the `undoCommand` stack and clear the `redoCommand` stack.
				this._undoCommand.addBatch( batch );
				this._redoCommand.clearStack();
			}
		}, { priority: 'highest' } );

		this.listenTo<UndoCommandRevertEvent>( this._undoCommand, 'revert', ( evt, undoneBatch, undoingBatch ) => {
			this._redoCommand.addBatch( undoingBatch );
		} );

		editor.keystrokes.set( 'CTRL+Z', 'undo' );
		editor.keystrokes.set( 'CTRL+Y', 'redo' );
		editor.keystrokes.set( 'CTRL+SHIFT+Z', 'redo' );
	}
}
