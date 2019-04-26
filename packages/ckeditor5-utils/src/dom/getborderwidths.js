/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/dom/getborderwidths
 */

/**
 * Returns an object containing CSS border widths of a specified HTML element.
 *
 * @param {HTMLElement} element An element which has CSS borders.
 * @returns {Object} An object containing `top`, `left`, `right` and `bottom` properties
 * with numerical values of the `border-[top,left,right,bottom]-width` CSS styles.
 */
export default function getBorderWidths( element ) {
	// Call getComputedStyle on the window the element document belongs to.
	const style = element.ownerDocument.defaultView.getComputedStyle( element );

	return {
		top: parseInt( style.borderTopWidth, 10 ),
		right: parseInt( style.borderRightWidth, 10 ),
		bottom: parseInt( style.borderBottomWidth, 10 ),
		left: parseInt( style.borderLeftWidth, 10 )
	};
}
