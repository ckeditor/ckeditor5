/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module typing/utils
 */

import ViewText from '@ckeditor/ckeditor5-engine/src/view/text';
import diff from '@ckeditor/ckeditor5-utils/src/diff';
import diffToChanges from '@ckeditor/ckeditor5-utils/src/difftochanges';

/**
 * Returns true if container children have mutated or more than a single text node was changed.
 *
 * Single text node child insertion is handled in {@link module:typing/input~MutationHandler#_handleTextNodeInsertion}
 * while text mutation is handled in {@link module:typing/input~MutationHandler#_handleTextMutation}.
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
 * @returns {Object|undefined} Change object or undefined if more than a single text node was changed.
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
	if ( !( change.values[ 0 ] instanceof ViewText ) ) {
		return;
	}

	return change;
}

/**
 * Helper function that compares whether two given view nodes are the same.
 * It is used in `diff` when it's passed an array with child nodes.
 *
 * @param {module:engine/view/node~Node} oldChild
 * @param {module:engine/view/node~Node} newChild
 * @returns {Boolean}
 */
export function compareChildNodes( oldChild, newChild ) {
	if ( oldChild instanceof ViewText && newChild instanceof ViewText ) {
		return oldChild.data === newChild.data;
	} else {
		return oldChild === newChild;
	}
}
