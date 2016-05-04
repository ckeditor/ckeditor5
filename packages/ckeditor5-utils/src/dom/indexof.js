/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * Returns index of the node in the parent element.
 *
 * @returns {Number} Index of the node in the parent element. Returns 0 if node has no parent.
 */
export default function indexOf( node ) {
	let index = 0;

	while ( node.previousSibling ) {
		node = node.previousSibling;
		index++;
	}

	return index;
}
