/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/findclosestscrollableancestor
 */

import { getParentElement } from './getparentelement.js';
import { global } from './global.js';

/**
 * Returns the closest scrollable ancestor of a DOM element.
 *
 * The search crosses shadow DOM boundaries, continuing from the host element of a shadow root instead of
 * stopping at it. Without that, an element rendered inside a shadow tree would report no scrollable ancestor at
 * all, even when one exists further up in the surrounding document, because the walk goes over `parentElement`,
 * which is `null` for a direct child of a shadow root. Works for both open and closed shadow roots.
 *
 * @param domElement DOM element.
 * @returns First ancestor of `domElement` that is scrollable or null if such ancestor doesn't exist.
 */
export function findClosestScrollableAncestor( domElement: HTMLElement ): HTMLElement | null {
	let element = getParentElement( domElement ) as HTMLElement | null;

	if ( !element ) {
		return null;
	}

	while ( element.tagName != 'BODY' ) {
		const overflow = element.style.overflowY || global.window.getComputedStyle( element ).overflowY;

		if ( overflow === 'auto' || overflow === 'scroll' ) {
			break;
		}

		element = getParentElement( element ) as HTMLElement | null;

		if ( !element ) {
			return null;
		}
	}

	return element;
}
