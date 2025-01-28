/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/getpositionedancestor
 */

import global from './global.js';

/**
 * For a given element, returns the nearest ancestor element which CSS position is not "static".
 *
 * @param element The native DOM element to be checked.
 */
export default function getPositionedAncestor( element?: HTMLElement ): HTMLElement | null {
	if ( !element || !element.parentNode ) {
		return null;
	}

	if ( element.offsetParent === global.document.body ) {
		return null;
	}

	return element.offsetParent as HTMLElement;
}
