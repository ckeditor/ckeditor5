/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/isshadowhostof
 */

/**
 * Checks whether the given node is the host of any of the given shadow roots.
 *
 * Answers "is this a stand-in for something inside one of these roots, rather than the real thing?". A DOM API
 * that cannot reach into a shadow tree reports its host in place of the node inside it – most commonly an event
 * target, retargeted for a listener that does not live in that tree. Works for open and closed roots alike.
 *
 * @param node The node to test.
 * @param shadowRoots The shadow roots to test against.
 */
export function isShadowHostOf( node: EventTarget | null, shadowRoots: Iterable<ShadowRoot> ): boolean {
	if ( !node ) {
		return false;
	}

	for ( const root of shadowRoots ) {
		if ( root.host === node ) {
			return true;
		}
	}

	return false;
}
