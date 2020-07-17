/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/view/emptyelement
 */

import Element from './element';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import Node from './node';

/**
 * Empty element class. It is used to represent elements that cannot contain any child nodes (for example `<img>` elements).
 *
 * To create a new empty element use the
 * {@link module:engine/view/downcastwriter~DowncastWriter#createEmptyElement `downcastWriter#createEmptyElement()`} method.
 *
 * @extends module:engine/view/element~Element
 */
export default class EmptyElement extends Element {
	/**
	 * Creates new instance of EmptyElement.
	 *
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-emptyelement-cannot-add` when third parameter is passed,
	 * to inform that usage of EmptyElement is incorrect (adding child nodes to EmptyElement is forbidden).
	 *
	 * @see module:engine/view/downcastwriter~DowncastWriter#createEmptyElement
	 * @protected
	 * @param {module:engine/view/document~Document} document The document instance to which this element belongs.
	 * @param {String} name Node name.
	 * @param {Object|Iterable} [attrs] Collection of attributes.
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} [children]
	 * A list of nodes to be inserted into created element.
	 */
	constructor( document, name, attrs, children ) {
		super( document, name, attrs, children );

		/**
		 * Returns `null` because filler is not needed for EmptyElements.
		 *
		 * @method #getFillerOffset
		 * @returns {null} Always returns null.
		 */
		this.getFillerOffset = getFillerOffset;
	}

	/**
	 * Checks whether this object is of the given.
	 *
	 *		emptyElement.is( 'emptyElement' ); // -> true
	 *		emptyElement.is( 'element' ); // -> true
	 *		emptyElement.is( 'node' ); // -> true
	 *		emptyElement.is( 'view:emptyElement' ); // -> true
	 *		emptyElement.is( 'view:element' ); // -> true
	 *		emptyElement.is( 'view:node' ); // -> true
	 *
	 *		emptyElement.is( 'model:element' ); // -> false
	 *		emptyElement.is( 'documentFragment' ); // -> false
	 *
	 * Assuming that the object being checked is an empty element, you can also check its
	 * {@link module:engine/view/emptyelement~EmptyElement#name name}:
	 *
	 *		emptyElement.is( 'element', 'img' ); // -> true if this is a img element
	 *		emptyElement.is( 'emptyElement', 'img' ); // -> same as above
	 *		text.is( 'element', 'img' ); -> false
	 *
	 * {@link module:engine/view/node~Node#is Check the entire list of view objects} which implement the `is()` method.
	 *
	 * @param {String} type Type to check when `name` parameter is present.
	 * Otherwise, it acts like the `name` parameter.
	 * @param {String} [name] Element name.
	 * @returns {Boolean}
	 */
	is( type, name = null ) {
		if ( !name ) {
			return type === 'emptyElement' || type === 'view:emptyElement' ||
				// From super.is(). This is highly utilised method and cannot call super. See ckeditor/ckeditor5#6529.
				type === this.name || type === 'view:' + this.name ||
				type === 'element' || type === 'view:element' ||
				type === 'node' || type === 'view:node';
		} else {
			return name === this.name && (
				type === 'emptyElement' || type === 'view:emptyElement' ||
				type === 'element' || type === 'view:element'
			);
		}
	}

	/**
	 * Overrides {@link module:engine/view/element~Element#_insertChild} method.
	 * Throws {@link module:utils/ckeditorerror~CKEditorError CKEditorError} `view-emptyelement-cannot-add` to prevent
	 * adding any child nodes to EmptyElement.
	 *
	 * @protected
	 */
	_insertChild( index, nodes ) {
		if ( nodes && ( nodes instanceof Node || Array.from( nodes ).length > 0 ) ) {
			/**
			 * Cannot add children to {@link module:engine/view/emptyelement~EmptyElement}.
			 *
			 * @error view-emptyelement-cannot-add
			 */
			throw new CKEditorError(
				'view-emptyelement-cannot-add: Cannot add child nodes to EmptyElement instance.',
				[ this, nodes ]
			);
		}
	}
}

// Returns `null` because block filler is not needed for EmptyElements.
//
// @returns {null}
function getFillerOffset() {
	return null;
}
