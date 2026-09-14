/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getlayoutparentelement
 */

import { getParentElement } from './getparentelement.js';

/**
 * Returns the parent element in the **flattened tree**, the one the browser lays out and paints.
 *
 * The layout-aware counterpart of {@link module:utils/dom/getparentelement~getParentElement}, and the element-only
 * form of {@link module:utils/dom/getlayoutparentnode~getLayoutParentNode} – see that one for why the flattened
 * tree and the node tree disagree for slotted content, and for when to prefer which.
 *
 * Use it to walk outwards over the elements that lay a node out: its scrollable ancestors, its clipping ancestors.
 * Works for open and closed roots alike, and falls back to the node tree for slotted content inside a closed root,
 * whose slot the DOM standard does not expose.
 *
 * @param node The node to get the layout parent element of.
 */
export function getLayoutParentElement( node: Node ): Element | null {
	// A `<slot>` is an element, so it is already the answer where there is one. Everything else – including a
	// shadow boundary, which has no `assignedSlot` – is the node-tree step.
	return ( node as Element ).assignedSlot || getParentElement( node );
}
