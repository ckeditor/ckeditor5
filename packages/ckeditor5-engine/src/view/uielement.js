/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/view/uielement
 */

import Element from './element';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import Node from './node';

/**
 * UIElement class. It is used to represent UI not a content of the document.
 * This element can't be split and selection can't be placed inside this element.
 */
export default class UIElement extends Element {
	/**
	 * Creates new instance of UIElement.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-uielement-cannot-add` when third parameter is passed,
	 * to inform that usage of UIElement is incorrect (adding child nodes to UIElement is forbidden).
	 *
	 * @param {String} name Node name.
	 * @param {Object|Iterable} [attributes] Collection of attributes.
	 */
	constructor( name, attributes, children ) {
		super( name, attributes, children );

		/**
		 * Returns `null` because filler is not needed for UIElements.
		 *
		 * @method #getFillerOffset
		 * @returns {null} Always returns null.
		 */
		this.getFillerOffset = getFillerOffset;
	}

	/**
	 * @inheritDoc
	 */
	is( type, name = null ) {
		if ( !name ) {
			return type == 'uiElement' || super.is( type );
		} else {
			return ( type == 'uiElement' && name == this.name ) || super.is( type, name );
		}
	}

	/**
	 * Overrides {@link module:engine/view/element~Element#insertChildren} method.
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-uielement-cannot-add` to prevent adding any child nodes
	 * to UIElement.
	 */
	insertChildren( index, nodes ) {
		if ( nodes && ( nodes instanceof Node || Array.from( nodes ).length > 0 ) ) {
			/**
			 * Cannot add children to {@link module:engine/view/uielement~UIElement}.
			 *
			 * @error view-uielement-cannot-add
			 */
			throw new CKEditorError( 'view-uielement-cannot-add: Cannot add child nodes to UIElement instance.' );
		}
	}
}

// Returns `null` because block filler is not needed for UIElements.
//
// @returns {null}
function getFillerOffset() {
	return null;
}
