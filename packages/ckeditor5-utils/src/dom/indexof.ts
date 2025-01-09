/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/indexof
 */

/**
 * Returns index of the node in the parent element.
 *
 * @param node Node which index is tested.
 * @returns Index of the node in the parent element. Returns 0 if node has no parent.
 */
export default function indexOf( node: Node ): number {
	let index = 0;

	while ( node.previousSibling ) {
		node = node.previousSibling;
		index++;
	}

	return index;
}
