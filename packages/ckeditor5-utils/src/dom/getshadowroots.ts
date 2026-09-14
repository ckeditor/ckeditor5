/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getshadowroots
 */

import { isShadowRoot } from './isshadowroot.js';
import { getLayoutParentNode } from './getlayoutparentnode.js';

/**
 * Returns every shadow root the given node renders in, innermost first.
 *
 * For code that has to act on *all* the shadow boundaries above a node – attaching listeners, injecting styles –
 * rather than only the nearest one. Empty for a node in the light DOM, and one entry per boundary for a node
 * inside nested trees. Works for open and closed roots alike.
 *
 * Derived from the tree the node sits in, not from whether that tree is in a document: a node inside a shadow
 * root reports that root even while its host is detached, because `attachShadow()` makes the shadow tree – and
 * its root – real right away. Callers that only care about the roots a node is currently *rendered* in should
 * check `Node#isConnected` themselves.
 *
 * @param node The node to collect the hosting shadow roots of.
 */
export function getShadowRoots( node: Node ): Array<ShadowRoot> {
	const shadowRoots: Array<ShadowRoot> = [];

	// One ancestor at a time, rather than a hop from root to root through `getRootNode()`. A slotted node belongs
	// to its host's tree while rendering in the tree that holds the slot, so `getRootNode()` never reports the
	// second one. Hopping from a host straight to its own root misses it too, because `assignedSlot` sits on
	// whichever element was assigned, and that can be an ordinary element any number of levels above the host.
	let current: Node | null = node;

	while ( current ) {
		if ( isShadowRoot( current ) ) {
			shadowRoots.push( current );
		}

		current = getLayoutParentNode( current );
	}

	return shadowRoots;
}
