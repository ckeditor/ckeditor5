/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module utils/elementreplacer
 */

/**
 * Utility class allowing to hide existing HTML elements or replace them with given ones in a way that doesn't remove
 * the original elements from the DOM.
 */
export default class ElementReplacer {
	constructor() {
		/**
		 * The elements replaced by {@link #replace} and their replacements.
		 *
		 * @private
		 * @member {Array.<Object>}
		 */
		this._replacedElements = [];
	}

	/**
	 * Hides the `element` and, if specified, inserts the the given element next to it.
	 *
	 * The effect of this method can be reverted by {@link #restore}.
	 *
	 * @param {HTMLElement} element The element to replace.
	 * @param {HTMLElement} [newElement] The replacement element. If not passed, then the `element` will just be hidden.
	 */
	replace( element, newElement ) {
		this._replacedElements.push( { element, newElement } );

		element.style.display = 'none';

		if ( newElement ) {
			element.parentNode.insertBefore( newElement, element.nextSibling );
		}
	}

	/**
	 * Restores what {@link #replace} did.
	 */
	restore() {
		this._replacedElements.forEach( ( { element, newElement } ) => {
			element.style.display = '';

			if ( newElement ) {
				newElement.remove();
			}
		} );

		this._replacedElements = [];
	}
}
