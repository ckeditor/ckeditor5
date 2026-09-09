/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/containsnode
 */

import { getParentNode } from './getparentnode.js';

/**
 * Checks whether `node` is inside `container`, looking through shadow roots on the way.
 *
 * Use it instead of `Node#contains()`, which stops at a shadow root: that one says `false` even when
 * `container` really is an ancestor, as long as a shadow root sits between the two. A node contains itself
 * here, just like it does there.
 *
 * `container` can also be a `Document` or a `ShadowRoot` – useful for a `scroll` event, for example, whose
 * target is the document and not an element. Works with open and closed shadow roots.
 *
 * @param container The node that may be the ancestor.
 * @param node The node to look for. May be `null`, which always gives `false`.
 */
export function containsNode( container: Node, node: Node | null ): boolean {
	let current: Node | null = node;

	while ( current ) {
		if ( current === container ) {
			return true;
		}

		current = getParentNode( current );
	}

	return false;
}
