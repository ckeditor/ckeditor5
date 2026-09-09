/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getactiveelement
 */

/**
 * Returns the focused element in the tree the given node lives in.
 *
 * The shadow-aware replacement for `document.activeElement`, which reports the host of a shadow tree rather
 * than the focused element inside it. Pass any node from the tree whose focus is in question – typically the
 * element being checked itself. Works for open and closed roots alike.
 *
 * @param node The node whose tree's active element should be returned.
 */
export function getActiveElement( node: Node ): Element | null {
	// A detached node's root is a plain `Element`/`DocumentFragment` with no `activeElement`, so
	// coalesce the resulting `undefined` to `null` to honor the return type.
	return ( node.getRootNode() as ShadowRoot | Document ).activeElement ?? null;
}
