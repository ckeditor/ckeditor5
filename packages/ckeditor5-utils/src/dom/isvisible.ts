/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/dom/isvisible
 */

import isText from './istext.js';

/**
 * Checks whether the element is visible to the user in DOM:
 *
 * * connected to the root of the document,
 * * has no `display: none`,
 * * has no ancestors with `display: none`.
 *
 * **Note**: This helper does not check whether the element is hidden by cropping, overflow, etc..
 * To check that, use {@link module:utils/dom/rect~Rect} instead.
 */
export default function isVisible( element: Text | HTMLElement | null | undefined ): boolean {
	if ( !element ) {
		return false;
	}

	if ( isText( element ) ) {
		return isVisible( element.parentElement );
	}

	if ( element.getClientRects ) {
		return !!( element.getClientRects().length );
	}

	return false;
}
