/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/delete
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import DeleteCommand from './deletecommand';
import DeleteObserver from './deleteobserver';
import env from '@ckeditor/ckeditor5-utils/src/env';

/**
 * The delete and backspace feature. Handles keys such as <kbd>Delete</kbd> and <kbd>Backspace</kbd>, other
 * keystrokes and user actions that result in deleting content in the editor.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Delete extends Plugin {
	/**
	 * Whether pressing backspace should trigger undo action
	 *
	 * @private
	 * @member {Boolean} #_undoOnBackspace
	 */

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Delete';
	}

	/**
	 * @inheritDoc
	 */
	init() {
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

		this.listenTo( viewDocument, 'delete', ( evt, data ) => {
			data.preventDefault();

			const { direction, sequence, selectionToRemove, unit } = data;
			const commandName = direction === 'forward' ? 'deleteForward' : 'delete';
			const commandData = { unit, sequence };

			if ( unit == 'selection' ) {
				const modelRanges = Array.from( selectionToRemove.getRanges() ).map( viewRange => {
					return editor.editing.mapper.toModelRange( viewRange );
				} );

				commandData.selection = editor.model.createSelection( modelRanges );
			}

			editor.execute( commandName, commandData );

			view.scrollToTheSelection();
		}, { priority: 'low' } );

		// Android IMEs have a quirk - they change DOM selection after the input changes were performed by the browser.
		// This happens on `keyup` event. Android doesn't know anything about our deletion and selection handling.
		// Even if the selection was changed during input events, IME remembers the position where the selection "should"
		// be placed and moves it there.
		//
		// To prevent incorrect selection, we save the selection after deleting here and then re-set it on `keyup`.
		// This has to be done on DOM selection level, because on `keyup` the model selection is still the same as it was
		// just after deletion, so it wouldn't be changed and the fix would do nothing.
		//
		// **Note**: See DeleteObserver for the first part of this quirk.
		if ( env.isAndroid ) {
			let domSelectionAfterDeletion = null;

			// This listener records the native DOM selection after deleting (note the lowest listener priority).
			this.listenTo( viewDocument, 'delete', ( evt, data ) => {
				const domSelection = data.domTarget.ownerDocument.defaultView.getSelection();

				domSelectionAfterDeletion = {
					anchorNode: domSelection.anchorNode,
					anchorOffset: domSelection.anchorOffset,
					focusNode: domSelection.focusNode,
					focusOffset: domSelection.focusOffset
				};
			}, { priority: 'lowest' } );

			// This listener fixes the native DOM selection after deleting.
			this.listenTo( viewDocument, 'keyup', ( evt, data ) => {
				if ( domSelectionAfterDeletion ) {
					const domSelection = data.domTarget.ownerDocument.defaultView.getSelection();

					domSelection.collapse( domSelectionAfterDeletion.anchorNode, domSelectionAfterDeletion.anchorOffset );
					domSelection.extend( domSelectionAfterDeletion.focusNode, domSelectionAfterDeletion.focusOffset );

					domSelectionAfterDeletion = null;
				}
			} );
		}

		if ( this.editor.plugins.has( 'UndoEditing' ) ) {
			this.listenTo( viewDocument, 'delete', ( evt, data ) => {
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
	requestUndoOnBackspace() {
		if ( this.editor.plugins.has( 'UndoEditing' ) ) {
			this._undoOnBackspace = true;
		}
	}
}
