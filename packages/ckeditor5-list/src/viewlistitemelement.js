/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module list/viewlistitemelement
 */

import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';

/**
 * View element class representing a list item (`<li>`). It extends {@link module:engine/view/containerelement~ContainerElement}
 * and overwrites {@link module:list/viewlistitemelement~ViewListItemElement#getFillerOffset evaluating whether filler offset}
 * is needed.
 *
 * @extends module:engine/view/containerelement~ContainerElement
 */
export default class ViewListItemElement extends ViewContainerElement {
	/**
	 * Creates a `<li>` view item.
	 *
	 * @param {Object|Iterable} [attrs] A collection of attributes.
	 * @param {module:engine/view/node~Node|Iterable.<module:engine/view/node~Node>} [children] The list of nodes to be inserted
	 * into the created element.
	 */
	constructor( attrs, children ) {
		super( 'li', attrs, children );

		/**
		 * @inheritDoc
		 */
		this.getFillerOffset = getFillerOffset;
	}
}

// Implementation of getFillerOffset for ViewListItemElements.
//
// @returns {Number|null} Block filler offset or `null` if block filler is not needed.
function getFillerOffset() {
	const hasOnlyLists = !this.isEmpty && ( this.getChild( 0 ).name == 'ul' || this.getChild( 0 ).name == 'ol' );

	return this.isEmpty || hasOnlyLists ? 0 : null;
}
