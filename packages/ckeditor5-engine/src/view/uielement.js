/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/uielement
 */

import Element from './element';

/**
 * UIElement class. It is used to represent features of UI not content of the document.
 * This element can't be split and selection can't be placed inside this element.
 */
export default class UIElement extends Element {
	/**
	 * Creates new instance of UIElement.
	 *
	 * @see module:engine/view/element~Element
	 */
	constructor( name, attributes, children ) {
		super( name, attributes, children );

		/**
		 * Returns `null` because filler is not needed for EmptyElements.
		 *
		 * @method #getFillerOffset
		 * @returns {null} Always returns null.
		 */
		this.getFillerOffset = getFillerOffset;
	}
}

// Returns `null` because block filler is not needed for EmptyElements.
//
// @returns {null}
function getFillerOffset() {
	return null;
}
