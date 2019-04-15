/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/getpositionedancestor
 */

import global from './global';

/**
 * For a given element, returns the nearest ancestor element which CSS position is not "static".
 *
 * @param {HTMLElement} element The native DOM element to be checked.
 * @returns {HTMLElement|null}
 */
export default function getPositionedAncestor( element ) {
	while ( element && element.tagName.toLowerCase() != 'html' ) {
		if ( global.window.getComputedStyle( element ).position != 'static' ) {
			return element;
		}

		element = element.parentElement;
	}

	return null;
}
