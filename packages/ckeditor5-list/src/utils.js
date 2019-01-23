/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module list/utils
 */

import { getFillerOffset } from '@ckeditor/ckeditor5-engine/src/view/containerelement';

/**
 * Creates list item {@link module:engine/view/containerelement~ContainerElement}.
 *
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The writer instance.
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createViewListItemElement( writer ) {
	const viewItem = writer.createContainerElement( 'li' );
	viewItem.getFillerOffset = getListItemFillerOffset;

	return viewItem;
}

// Implementation of getFillerOffset for view list item element.
//
// @returns {Number|null} Block filler offset or `null` if block filler is not needed.
function getListItemFillerOffset() {
	const hasOnlyLists = !this.isEmpty && ( this.getChild( 0 ).name == 'ul' || this.getChild( 0 ).name == 'ol' );

	if ( this.isEmpty || hasOnlyLists ) {
		return 0;
	}

	return getFillerOffset.call( this );
}
