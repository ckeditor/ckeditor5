/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ViewContainerElement from '@ckeditor/ckeditor5-engine/src/view/containerelement';

/**
 * @module list/utils
 */

/**
 * Creates list item {@link module:engine/view/containerelement~ContainerElement}.
 *
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createViewListItemElement() {
	const viewItem = new ViewContainerElement( 'li' );
	viewItem.getFillerOffset = getFillerOffset;

	return viewItem;
}

// Implementation of getFillerOffset for view list item element.
//
// @returns {Number|null} Block filler offset or `null` if block filler is not needed.
function getFillerOffset() {
	const hasOnlyLists = !this.isEmpty && ( this.getChild( 0 ).name == 'ul' || this.getChild( 0 ).name == 'ol' );

	return this.isEmpty || hasOnlyLists ? 0 : null;
}
