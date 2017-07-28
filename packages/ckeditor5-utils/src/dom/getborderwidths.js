/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module utils/dom/getborderwidths
 */

import global from './global';

/**
 * Returns an object containing CSS border withs of a specified `HTMLElement`.
 *
 * @param {HTMLElement} element An element which has CSS borders.
 * @param {Object} An object containing `top`, `left`, `right` and `bottom` properties
 * with numerical values of the `border-[top,left,right,bottom]-width` CSS styles.
 */
export default function getBorderWidths( element ) {
	const computedStyles = global.window.getComputedStyle( element );
	const borderWidths = {
		top: computedStyles.borderTopWidth,
		right: computedStyles.borderRightWidth,
		bottom: computedStyles.borderBottomWidth,
		left: computedStyles.borderLeftWidth
	};

	for ( const width in borderWidths ) {
		borderWidths[ width ] = parseInt( borderWidths[ width ], 10 );
	}

	return borderWidths;
}
