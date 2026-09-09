/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getoverlaymountroot
 */

import { isNativeShadowRoot } from './isshadowroot.js';

/**
 * Returns the DOM tree that a feature's floating UI – its balloons, dialogs and tooltips – should be put in:
 * the same one the feature itself is in.
 *
 * Floating UI would otherwise go into `document.body`. That is outside the shadow root an editor may live in,
 * so the UI would leave the tree the editor's styles were loaded into, and lose them.
 *
 * Being in the same tree means one of three things:
 *
 * * the shadow root the given element is in, if it is in one. A shadow root passed in returns itself.
 * * the `<body>` of that element's own document otherwise, so an editor in an iframe stays in that iframe.
 * * `null` while the element is detached, because there is no telling yet which tree it will end up in. Put
 *   the UI nowhere for now and ask again once the element is in the DOM.
 *
 * Feed the result to {@link module:ui/editorui/bodycollection~BodyCollection#syncMountTarget}, and call this
 * again whenever the element may have moved. Works with open and closed shadow roots.
 *
 * @param containerNode The element the floating UI belongs to – usually the feature's container.
 */
export function getOverlayMountRoot( containerNode: Element | ShadowRoot ): HTMLElement | ShadowRoot | null {
	if ( !containerNode.isConnected ) {
		return null;
	}

	const root = containerNode.getRootNode();

	return isNativeShadowRoot( root ) ? root : containerNode.ownerDocument.body;
}
