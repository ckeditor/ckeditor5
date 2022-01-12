/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/indexof
 */

/**
 * Returns index of the node in the parent element.
 *
 * @param {Node} node Node which index is tested.
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
