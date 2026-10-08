/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getparentelement
 */

import { isShadowRoot } from './isshadowroot.js';

/**
 * Returns the parent element of the given node, crossing shadow boundaries.
 *
 * The shadow-aware replacement for `Node#parentElement`, which is `null` for a node sitting directly in a
 * `ShadowRoot` and so stops an outward walk at the boundary. Works for open and closed roots alike.
 *
 * @param node The node to get the parent element of.
 */
export function getParentElement( node: Node ): Element | null {
	// eslint-disable-next-line ckeditor5-rules/no-shadow-unsafe-dom-apis
	const parent = node.parentNode;

	// A `ShadowRoot` is not an element, so the walk continues from its host, which is where the tree is
	// attached in the surrounding DOM.
	// eslint-disable-next-line ckeditor5-rules/no-shadow-unsafe-dom-apis
	return isShadowRoot( parent ) ? parent.host : node.parentElement;
}
