/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/utils/injectunsafekeystrokeshandling
 */

import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';
import env from '@ckeditor/ckeditor5-utils/src/env';
import { isShiftDeleteOnNonCollapsedSelection } from './utils';

/**
 * Handles keystrokes which are unsafe for typing. This handler's logic is explained
 * in https://github.com/ckeditor/ckeditor5-typing/issues/83#issuecomment-398690251.
 *
 * @param {module:core/editor/editor~Editor} editor The editor instance.
 */
export default function injectUnsafeKeystrokesHandling( editor ) {
	let latestCompositionSelection = null;

	const model = editor.model;
	const view = editor.editing.view;
	const inputCommand = editor.commands.get( 'input' );

	// For Android, we want to handle keystrokes on `beforeinput` to be sure that code in `DeleteObserver` already had a chance to be fired.
	if ( env.isAndroid ) {
		view.document.on( 'beforeinput', ( evt, evtData ) => handleUnsafeKeystroke( evtData ), { priority: 'lowest' } );
	} else {
		view.document.on( 'keydown', ( evt, evtData ) => handleUnsafeKeystroke( evtData ), { priority: 'lowest' } );
	}

	view.document.on( 'compositionstart', handleCompositionStart, { priority: 'lowest' } );

	view.document.on( 'compositionend', () => {
		latestCompositionSelection = model.createSelection( model.document.selection );
	}, { priority: 'lowest' } );

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
		// Do not delete the content, if Shift + Delete key combination was pressed on a non-collapsed selection on Windows.
		//
		// The Shift + Delete key combination should work in the same way as the `cut` event on a non-collapsed selection on Windows.
		// In fact, the native `cut` event is actually emitted in this case, but with lower priority. Therefore, in order to handle the
		// Shift + Delete key combination correctly, it is enough to prevent the content deletion here.
		if ( env.isWindows && isShiftDeleteOnNonCollapsedSelection( evtData, view.document ) ) {
			return;
		}

		const doc = model.document;
		const isComposing = view.document.isComposing;
		const isSelectionUnchanged = latestCompositionSelection && latestCompositionSelection.isEqual( doc.selection );

		// Reset stored composition selection.
		latestCompositionSelection = null;

		// By relying on the state of the input command we allow disabling the entire input easily
		// by just disabling the input command. We could’ve used here the delete command but that
		// would mean requiring the delete feature which would block loading one without the other.
		// We could also check the editor.isReadOnly property, but that wouldn't allow to block
		// the input without blocking other features.
		if ( !inputCommand.isEnabled ) {
			return;
		}

		if ( isNonTypingKeystroke( evtData ) || doc.selection.isCollapsed ) {
			return;
		}

		// If during composition, deletion should be prevented as it may remove composed sequence (#83).
		if ( isComposing && evtData.keyCode === 229 ) {
			return;
		}

		// If there is a `keydown` event fired with '229' keycode it might be related
		// to recent composition. Check if selection is the same as upon ending recent composition,
		// if so do not remove selected content as it will remove composed sequence (#83).
		if ( !isComposing && evtData.keyCode === 229 && isSelectionUnchanged ) {
			return;
		}

		deleteSelectionContent();
	}

	// Handles the `compositionstart` event. It is used only in special cases to remove the contents
	// of a non-collapsed selection so composition itself does not result in complex mutations.
	//
	// The special case mentioned above is a situation in which the `keydown` event is fired after
	// `compositionstart` event. In such cases {@link #handleKeydown} cannot clear current selection
	// contents (because it is too late and will break the composition) so the composition handler takes care of it.
	function handleCompositionStart() {
		const doc = model.document;
		const isFlatSelection = doc.selection.rangeCount === 1 ? doc.selection.getFirstRange().isFlat : true;

		// If on `compositionstart` there is a non-collapsed selection which start and end have different parents
		// it means the `handleKeydown()` method did not remove its contents. It happens usually because
		// of different order of events (`compositionstart` before `keydown` - in Safari). In such cases
		// we need to remove selection contents on composition start (#83).
		if ( doc.selection.isCollapsed || isFlatSelection ) {
			return;
		}

		deleteSelectionContent();
	}

	function deleteSelectionContent() {
		const buffer = inputCommand.buffer;

		buffer.lock();

		const batch = buffer.batch;
		inputCommand._batches.add( batch );

		model.enqueueChange( batch, () => {
			model.deleteContent( model.document.selection );
		} );

		buffer.unlock();
	}
}

const safeKeycodes = [
	getCode( 'arrowUp' ),
	getCode( 'arrowRight' ),
	getCode( 'arrowDown' ),
	getCode( 'arrowLeft' ),
	9, // Tab
	16, // Shift
	17, // Ctrl
	18, // Alt
	19, // Pause
	20, // CapsLock
	27, // Escape
	33, // PageUp
	34, // PageDown
	35, // Home
	36, // End,
	45, // Insert,
	91, // Windows,
	93, // Menu key,
	144, // NumLock
	145, // ScrollLock,
	173, // Mute/Unmute
	174, // Volume up
	175, // Volume down,
	176, // Next song,
	177, // Previous song,
	178, // Stop,
	179, // Play/Pause,
	255 // Display brightness (increase and decrease)
];

// Function keys.
for ( let code = 112; code <= 135; code++ ) {
	safeKeycodes.push( code );
}

/**
 * Returns `true` if a keystroke will **not** result in "typing".
 *
 * For instance, keystrokes that result in typing are letters "a-zA-Z", numbers "0-9", delete, backspace, etc.
 *
 * Keystrokes that do not cause typing are, for instance, Fn keys (F5, F8, etc.), arrow keys (←, →, ↑, ↓),
 * Tab (↹), "Windows logo key" (⊞ Win), etc.
 *
 * Note: This implementation is very simple and will need to be refined with time.
 *
 * @param {module:engine/view/observer/keyobserver~KeyEventData} keyData
 * @returns {Boolean}
 */
export function isNonTypingKeystroke( keyData ) {
	// Keystrokes which contain Ctrl or Cmd don't represent typing.
	if ( keyData.ctrlKey || keyData.metaKey ) {
		return true;
	}

	return safeKeycodes.includes( keyData.keyCode );
}
