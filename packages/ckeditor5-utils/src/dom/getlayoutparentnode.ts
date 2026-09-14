/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getlayoutparentnode
 */

import { getParentNode } from './getparentnode.js';

/**
 * Returns the node one step up the **flattened tree**, the one the browser lays out and paints.
 *
 * The layout-aware counterpart of {@link module:utils/dom/getparentnode~getParentNode}, which walks the node
 * tree. The two agree everywhere except for slotted content: assigning a node to a `<slot>` does not move it, so
 * it stays a child of the host in the node tree while rendering inside the slot. A node-tree walk out of such a
 * node therefore leaves into the light DOM and skips every element of the shadow tree that actually lays it out.
 *
 * Use this one for questions about geometry – what scrolls a node, what clips it, what it renders inside – and
 * {@link module:utils/dom/getparentnode~getParentNode} for questions about structure, such as what a node is a
 * descendant of for the purposes of DOM manipulation or event retargeting. Both cross shadow boundaries and both
 * work for open and closed roots alike.
 *
 * **Note**: `Element#assignedSlot` is `null` when the slot lives in a *closed* shadow root, which the DOM
 * standard does not expose. For slotted content inside a closed root this falls back to the node tree and
 * answers exactly as {@link module:utils/dom/getparentnode~getParentNode} does.
 *
 * @param node The node to step up from.
 */
export function getLayoutParentNode( node: Node ): ParentNode | null {
	// An assigned node renders inside its slot, so the slot is its layout parent. The walk continues from there,
	// inside the shadow tree, and ordinary traversal takes over. It recurses naturally for nested slots, as a
	// `<slot>` assigned to an outer slot has an `assignedSlot` of its own.
	//
	// A `ShadowRoot` has no `assignedSlot`, so a boundary falls through to the node-tree step, which hops to the
	// host.
	return ( node as Element ).assignedSlot || getParentNode( node );
}
