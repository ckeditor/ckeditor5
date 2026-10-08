/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getparentnode
 */

import { isShadowRoot } from './isshadowroot.js';

/**
 * Returns the node one step up the composed tree, crossing shadow boundaries.
 *
 * The shadow-aware replacement for `Node#parentNode`, and the primitive for walking from a node outwards to the
 * document. It steps over any node, so such a walk visits the `ShadowRoot` nodes on the way and reaches the
 * `Document` at the top – to walk elements only, use
 * {@link module:utils/dom/getparentelement~getParentElement}. Works for open and closed roots alike.
 *
 * @param node The node to step up from.
 */
export function getParentNode( node: Node ): ParentNode | null {
	// A `ShadowRoot` has no parent, so the walk continues from its host, which is where the tree is attached.
	// eslint-disable-next-line ckeditor5-rules/no-shadow-unsafe-dom-apis
	return isShadowRoot( node ) ? node.host : node.parentNode;
}
