/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/utils/utils
 */

import diff from '@ckeditor/ckeditor5-utils/src/diff';
import diffToChanges from '@ckeditor/ckeditor5-utils/src/difftochanges';

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
