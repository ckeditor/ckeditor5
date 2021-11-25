/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/isvisible
 */

/**
 * Checks if the element is visible in DOM (no `display: block`, no ancestor with `display: none`).
 *
 * @param {HTMLElement} element
 * @returns {Boolean}
 */
export default function isVisible( element ) {
	return !!( element && element.getClientRects().length );
}
