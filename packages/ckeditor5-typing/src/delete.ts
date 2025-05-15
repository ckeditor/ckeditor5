/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module typing/delete
 */

import { BubblingEventInfo, DomEventData, type ViewDocumentKeyDownEvent } from '@ckeditor/ckeditor5-engine';
import { Plugin } from '@ckeditor/ckeditor5-core';
import { keyCodes } from '@ckeditor/ckeditor5-utils';
import DeleteCommand from './deletecommand.js';
import DeleteObserver, { type DeleteEventData, type ViewDocumentDeleteEvent } from './deleteobserver.js';

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
	public static get pluginName() {
		return 'Delete' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
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

		// Handle the Backspace key while at the beginning of a nested editable. See https://github.com/ckeditor/ckeditor5/issues/17383.
		this.listenTo<ViewDocumentKeyDownEvent>( viewDocument, 'keydown', ( evt, data ) => {
			if (
				viewDocument.isComposing ||
				data.keyCode != keyCodes.backspace ||
				!modelDocument.selection.isCollapsed
			) {
				return;
			}

			const ancestorLimit = editor.model.schema.getLimitElement( modelDocument.selection );
			const limitStartPosition = editor.model.createPositionAt( ancestorLimit, 0 );

			if ( limitStartPosition.isTouching( modelDocument.selection.getFirstPosition()! ) ) {
				// Stop the beforeinput event as it could be invalid.
				data.preventDefault();

				// Create a fake delete event so all features can act on it and the target range is proper.
				const modelRange = editor.model.schema.getNearestSelectionRange( limitStartPosition, 'forward' );

				if ( !modelRange ) {
					return;
				}

				const viewSelection = view.createSelection( editor.editing.mapper.toViewRange( modelRange ) );
				const targetRange = viewSelection.getFirstRange()!;

				const eventInfo = new BubblingEventInfo( document, 'delete', targetRange );
				const deleteData: Partial<DeleteEventData> = {
					unit: 'selection',
					direction: 'backward',
					selectionToRemove: viewSelection
				};

				viewDocument.fire( eventInfo, new DomEventData( view, data.domEvent, deleteData ) );
			}
		} );

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
