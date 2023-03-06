/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/delete
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import DeleteCommand from './deletecommand';
import DeleteObserver, { type ViewDocumentDeleteEvent } from './deleteobserver';

/**
 * The delete and backspace feature. Handles keys such as <kbd>Delete</kbd> and <kbd>Backspace</kbd>, other
 * keystrokes and user actions that result in deleting content in the editor.
 */
export default class Delete extends Plugin {
	/**
	 * Whether pressing backspace should trigger undo action
	 */
	private _undoOnBackspace!: boolean;

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'Delete' {
		return 'Delete';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;
		const modelDocument = editor.model.document;

		view.addObserver( DeleteObserver );

		this._undoOnBackspace = false;

		const deleteForwardCommand = new DeleteCommand( editor, 'forward' );

		// Register `deleteForward` command and add `forwardDelete` command as an alias for backward compatibility.
		editor.commands.add( 'deleteForward', deleteForwardCommand );
		editor.commands.add( 'forwardDelete', deleteForwardCommand );

		editor.commands.add( 'delete', new DeleteCommand( editor, 'backward' ) );

		this.listenTo<ViewDocumentDeleteEvent>( viewDocument, 'delete', ( evt, data ) => {
			// When not in composition, we handle the action, so prevent the default one.
			// When in composition, it's the browser who modify the DOM (renderer is disabled).
			if ( !viewDocument.isComposing ) {
				data.preventDefault();
			}

			const { direction, sequence, selectionToRemove, unit } = data;
			const commandName = direction === 'forward' ? 'deleteForward' : 'delete';
			const commandData: Parameters<DeleteCommand[ 'execute' ]>[ 0 ] = { sequence };

			if ( unit == 'selection' ) {
				const modelRanges = Array.from( selectionToRemove!.getRanges() ).map( viewRange => {
					return editor.editing.mapper.toModelRange( viewRange );
				} );

				commandData.selection = editor.model.createSelection( modelRanges );
			} else {
				commandData.unit = unit;
			}

			editor.execute( commandName, commandData );

			view.scrollToTheSelection();
		}, { priority: 'low' } );

		if ( this.editor.plugins.has( 'UndoEditing' ) ) {
			this.listenTo<ViewDocumentDeleteEvent>( viewDocument, 'delete', ( evt, data ) => {
				if ( this._undoOnBackspace && data.direction == 'backward' && data.sequence == 1 && data.unit == 'codePoint' ) {
					this._undoOnBackspace = false;

					editor.execute( 'undo' );

					data.preventDefault();
					evt.stop();
				}
			}, { context: '$capture' } );

			this.listenTo( modelDocument, 'change', () => {
				this._undoOnBackspace = false;
			} );
		}
	}

	/**
	 * If the next user action after calling this method is pressing backspace, it would undo the last change.
	 *
	 * Requires {@link module:undo/undoediting~UndoEditing} plugin. If not loaded, does nothing.
	 */
	public requestUndoOnBackspace(): void {
		if ( this.editor.plugins.has( 'UndoEditing' ) ) {
			this._undoOnBackspace = true;
		}
	}
}
