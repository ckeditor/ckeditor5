/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getelementfrompoint
 */

import { isElement as _isElement } from 'es-toolkit/compat';
import { global } from './global.js';
import { getParentElement } from './getparentelement.js';
import { isNativeShadowRoot } from './isshadowroot.js';

/**
 * `Document#caretPositionFromPoint()` with the `shadowRoots` option (Chrome 128+) is not yet part of the
 * TypeScript DOM typings, so the members this module relies on are declared here.
 */
interface DocumentWithCaretPositionFromPoint {
	caretPositionFromPoint?( x: number, y: number, options?: { shadowRoots?: Array<ShadowRoot> } ): {
		offsetNode: Node;
		offset: number;
	} | null;
}

/**
 * Returns the topmost element at the given viewport point, looking inside the given shadow roots.
 *
 * The shadow-aware replacement for `Document#elementFromPoint()`, which retargets a point inside a shadow tree
 * to that tree's host and so cannot report the element actually under it.
 *
 * Pass every shadow root a hit may land in – typically each editable's own `getRootNode()`. Only the innermost
 * root containing the point matters, so ancestor roots do not need to be listed, and a point in the light DOM
 * needs no roots at all.
 *
 * The point is hit tested strictly, honoring `pointer-events`, so the answer is the element that a click at
 * those coordinates would reach. The exception is an engine that cannot hit test a shadow root, where the point
 * is resolved from the nearest caret position instead and may land beside what it really hit.
 *
 * @param x The horizontal coordinate, relative to the viewport.
 * @param y The vertical coordinate, relative to the viewport.
 * @param shadowRoots The shadow roots the lookup is allowed to look inside. Empty for the light DOM.
 */
export function getElementFromPoint( x: number, y: number, shadowRoots: Array<ShadowRoot> = [] ): Element | null {
	const doc: Document & DocumentWithCaretPositionFromPoint = global.document;

	// Having `ShadowRoot#elementFromPoint()` is a property of the engine, not of one root, so the first root
	// answers for all. Checked on the root, as a global `ShadowRoot` would be the wrong realm in an iframe,
	// and with `in`, as the DOM typings declare the method always present and so rule a truthiness test out.
	const [ firstRoot ] = shadowRoots;

	if ( firstRoot && 'elementFromPoint' in firstRoot ) {
		for ( const root of shadowRoots ) {
			const element = root.elementFromPoint( x, y );

			// It hit tests the whole document and retargets into `root`, which leaves a node already outside
			// it as it is – so a point over a later root comes back as that root's host. Discard such a hit.
			if ( element && element.getRootNode() === root ) {
				return element;
			}
		}
	} else if ( firstRoot && doc.caretPositionFromPoint ) {
		// The roots cannot be hit tested, so the caret position is the only lookup left that pierces them.
		// Filtered here and not for the branch above, which hit tests each root through its own
		// `elementFromPoint()` – a synthetic root implements that faithfully, while this call rejects it
		// as it converts the option.
		const nativeShadowRoots = shadowRoots.filter( isNativeShadowRoot );
		// The `shadowRoots` option is honored by Chrome and Edge 128+, Firefox 150+, and Safari 26.2+.
		const caretPosition = doc.caretPositionFromPoint( x, y, { shadowRoots: nativeShadowRoots } );
		const offsetNode = caretPosition && caretPosition.offsetNode;
		const element = offsetNode && offsetNode.nodeType === Node.TEXT_NODE ?
			getParentElement( offsetNode ) :
			offsetNode;

		// This lookup is here to pierce the roots, so only an element inside one of them is of interest. An
		// engine ignoring the `shadowRoots` option answers with a host outside them instead, and one that
		// honors it still answers for a point in the light DOM – both left to the document below.
		if ( isElement( element ) && nativeShadowRoots.includes( element.getRootNode() as ShadowRoot ) ) {
			return element;
		}
	}

	return doc.elementFromPoint( x, y );
}

function isElement( value: unknown ): value is Element {
	return _isElement( value );
}
