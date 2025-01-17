/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/remove
 */

/**
 * Removes given node from parent.
 *
 * @param node Node to remove.
 */
export default function remove( node: Node ): void {
	const parent = node.parentNode;

	if ( parent ) {
		parent.removeChild( node );
	}
}
