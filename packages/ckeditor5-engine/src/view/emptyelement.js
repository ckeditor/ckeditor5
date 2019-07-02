/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
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
	 * @param {String} name Node name.
	 * @param {Object|Iterable} [attributes] Collection of attributes.
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

	/**
	 * @inheritDoc
	 */
	is( type, name = null ) {
		if ( !name ) {
			return type == 'emptyElement' || super.is( type );
		} else {
			return ( type == 'emptyElement' && name == this.name ) || super.is( type, name );
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
