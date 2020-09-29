/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/utils/input/injectlegacyunsafekeystrokeshandling
 */

import { isNonTypingKeystroke } from './utils';

/**
 * Handles keystrokes which are unsafe for typing. This handler's logic is explained
 * in https://github.com/ckeditor/ckeditor5-typing/issues/83#issuecomment-398690251.
 *
 * **Note**: This is a legacy handler for browsers that do **not** support Input Events. Others use
 * {@link module:typing/utils/input/injectbeforeinputtypinghandling~injectBeforeInputTypingHandling} instead.
 *
 * @protected
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export default function injectLegacyUnsafeKeystrokesHandling( editor ) {
	const model = editor.model;
	const view = editor.editing.view;
	const insertTextCommand = editor.commands.get( 'insertText' );

	view.document.on( 'keydown', ( evt, evtData ) => handleUnsafeKeystroke( evtData ), { priority: 'lowest' } );

	// Handles the keydown event. We need to guess whether such keystroke is going to result
	// in typing. If so, then before character insertion happens, any selected content needs
	// to be deleted. Otherwise the default browser deletion mechanism would be
	// triggered, resulting in:
	//
	// * Hundreds of mutations which could not be handled.
	// * But most importantly, loss of control over how the content is being deleted.
	//
	// The method is used in a low-priority listener, hence allowing other listeners (e.g. delete or enter features)
	// to handle the event.
	//
	// @param {module:engine/view/observer/keyobserver~KeyEventData} evtData
	function handleUnsafeKeystroke( evtData ) {
		const doc = model.document;

		// By relying on the state of the insert text command we allow disabling the entire text insertion
		// easily by just disabling the insert text command. We could’ve used here the delete command but that
		// would mean requiring the delete feature which would block loading one without the other.
		// We could also check the editor.isReadOnly property, but that wouldn't allow to block
		// the text insertion without blocking other features.
		if ( !insertTextCommand.isEnabled ) {
			return;
		}

		if ( isNonTypingKeystroke( evtData ) || doc.selection.isCollapsed ) {
			return;
		}

		deleteSelectionContent();
	}

	function deleteSelectionContent() {
		const buffer = insertTextCommand.buffer;

		buffer.lock();

		const batch = buffer.batch;
		insertTextCommand._batches.add( batch );

		model.enqueueChange( batch, () => {
			model.deleteContent( model.document.selection );
		} );

		buffer.unlock();
	}
}
