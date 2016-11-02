/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Element from './element.js';
import CKEditorError from '../../utils/ckeditorerror.js';

/**
 * EmptyElement class. It is used to represent elements that cannot contain any child nodes.
 */
export default class EmptyElement extends Element {
	/**
	 * Creates new instance of EmptyElement.
	 *
	 * @param {String} name Node name.
	 * @param {Object|Iterable} [attributes] Collection of attributes.
	 */
	constructor( name, attributes ) {
		super( name, attributes );
	}

	/**
	 * Overrides {@link engine.view.Element#appendChildren} method.
	 * Throws {@link utils.CKEditorError CKEditorError} `view-emptyelement-cannot-add` to prevent adding any child nodes
	 * to EmptyElement.
	 */
	appendChildren() {
		/**
		 * Cannot add children to {@link engine.view.EmptyElement}.
		 *
		 * @error view-emptyelement-cannot-add
		 */
		throw new CKEditorError( 'view-emptyelement-cannot-add: Cannot add child nodes to EmptyElement instance.' );
	}

	/**
	 * Overrides {@link engine.view.Element#insertChildren} method.
	 * Throws {@link utils.CKEditorError CKEditorError} `view-emptyelement-cannot-add` to prevent adding any child nodes
	 * to EmptyElement.
	 */
	insertChildren() {
		/**
		 * Cannot add children to {@link engine.view.EmptyElement}.
		 *
		 * @error view-emptyelement-cannot-add
		 */
		throw new CKEditorError( 'view-emptyelement-cannot-add: Cannot add child nodes to EmptyElement instance.' );
	}

	/**
	 * Returns `null` because block filler is not needed.
	 *
	 * @returns {null}
	 */
	getFillerOffset() {
		return null;
	}
}
