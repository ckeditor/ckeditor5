/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window */

/**
 * @module utils/dom/getpositionedancestor
 */

/**
 * For a given element, returns the nearest ancestor element which CSS position is not "static".
 *
 * @param {HTMLElement} element Native DOM element to be checked.
 * @returns {HTMLElement|null}
 */
export default function getPositionedAncestor( element ) {
	while ( element && element.tagName.toLowerCase() != 'html' ) {
		if ( window.getComputedStyle( element ).position != 'static' ) {
			return element;
		}

		element = element.parentElement;
	}

	return null;
}
