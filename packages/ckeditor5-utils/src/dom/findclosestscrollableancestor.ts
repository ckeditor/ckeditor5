/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/findclosestscrollableancestor
 */

import global from './global.js';

/**
 * Returns the closest scrollable ancestor of a DOM element.
 *
 * @param domElement DOM element.
 * @returns First ancestor of `domElement` that is scrollable or null if such ancestor doesn't exist.
 */
export default function findClosestScrollableAncestor( domElement: HTMLElement ): HTMLElement | null {
	let element = domElement.parentElement;
	if ( !element ) {
		return null;
	}

	while ( element.tagName != 'BODY' ) {
		const overflow = element.style.overflowY || global.window.getComputedStyle( element ).overflowY;

		if ( overflow === 'auto' || overflow === 'scroll' ) {
			break;
		}

		element = element.parentElement;

		if ( !element ) {
			return null;
		}
	}

	return element;
}
