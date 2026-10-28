/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/geteventroots
 */

import { getShadowRoots } from './getshadowroots.js';

/**
 * Returns every event root of the given node: the shadow roots it renders in, innermost first, followed by
 * the document it is connected to.
 *
 * For code that listens to the DOM events of a node, which a listener on `document` alone may miss: events that
 * are not `composed`, such as `scroll`, never leave the shadow root they started in, and the events that do are
 * retargeted to the shadow host. Works for open and closed roots alike.
 *
 * Like {@link module:utils/dom/getshadowroots~getShadowRoots}, it reports the shadow roots of a detached node too.
 * The document is only included while the node is connected to it. Empty for `null`.
 *
 * @param node The node to collect the event roots of.
 */
export function getEventRoots( node: Node | null ): Array<Document | ShadowRoot> {
	if ( !node ) {
		return [];
	}

	const roots: Array<Document | ShadowRoot> = getShadowRoots( node );

	if ( node.nodeType == Node.DOCUMENT_NODE ) {
		roots.push( node as Document );
	} else if ( node.isConnected ) {
		roots.push( node.ownerDocument! );
	}

	return roots;
}
