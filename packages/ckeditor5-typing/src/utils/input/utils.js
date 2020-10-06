/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/utils/input/utils
 */

import diff from '@ckeditor/ckeditor5-utils/src/diff';
import diffToChanges from '@ckeditor/ckeditor5-utils/src/difftochanges';
import { getCode } from '@ckeditor/ckeditor5-utils/src/keyboard';

const NON_TYPING_KEY_CODES = [
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
	NON_TYPING_KEY_CODES.push( code );
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
	// Keystrokes which contain Ctrl don't represent typing.
	if ( keyData.ctrlKey ) {
		return true;
	}

	return NON_TYPING_KEY_CODES.includes( keyData.keyCode );
}

/**
 * Returns true if container children have mutated or more than a single text node was changed.
 *
 * @private
 * @param {Array.<module:engine/view/observer/mutationobserver~MutatedText|
 * module:engine/view/observer/mutationobserver~MutatedChildren>} mutations
 * @returns {Boolean}
 */
export function containerChildrenMutated( mutations ) {
	if ( mutations.length == 0 ) {
		return false;
	}

	// Check if there is any mutation of `children` type or any mutation that changes more than one text node.
	for ( const mutation of mutations ) {
		if ( mutation.type === 'children' && !getSingleTextNodeChange( mutation ) ) {
			return true;
		}
	}

	return false;
}

/**
 * Returns change made to a single text node.
 *
 * @private
 * @param {module:engine/view/observer/mutationobserver~MutatedText|
 * module:engine/view/observer/mutationobserver~MutatedChildren} mutation
 * @returns {Object|undefined} Change object (see {@link module:utils/difftochanges~diffToChanges} output)
 * or undefined if more than a single text node was changed.
 */
export function getSingleTextNodeChange( mutation ) {
	// One new node.
	if ( mutation.newChildren.length - mutation.oldChildren.length != 1 ) {
		return;
	}

	// Which is text.
	const diffResult = diff( mutation.oldChildren, mutation.newChildren, compareChildNodes );
	const changes = diffToChanges( diffResult, mutation.newChildren );

	// In case of [ delete, insert, insert ] the previous check will not exit.
	if ( changes.length > 1 ) {
		return;
	}

	const change = changes[ 0 ];

	// Which is text.
	if ( !( !!change.values[ 0 ] && change.values[ 0 ].is( '$text' ) ) ) {
		return;
	}

	return change;
}

/**
 * Checks whether two view nodes are identical, which means they are the same object
 * or contain exactly same data (in case of text nodes).
 *
 * @private
 * @param {module:engine/view/node~Node} oldChild
 * @param {module:engine/view/node~Node} newChild
 * @returns {Boolean}
 */
export function compareChildNodes( oldChild, newChild ) {
	if ( !!oldChild && oldChild.is( '$text' ) && !!newChild && newChild.is( '$text' ) ) {
		return oldChild.data === newChild.data;
	} else {
		return oldChild === newChild;
	}
}
