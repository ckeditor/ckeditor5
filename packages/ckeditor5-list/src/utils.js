/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module list/utils
 */

/**
 * Creates list item {@link module:engine/view/containerelement~ContainerElement}.
 *
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The writer instance.
 * @returns {module:engine/view/containerelement~ContainerElement}
 */
export function createViewListItemElement( writer ) {
	const viewItem = writer.createContainerElement( 'li' );
	viewItem.getFillerOffset = getFillerOffset;

	return viewItem;
}

// Implementation of getFillerOffset for view list item element.
//
// @returns {Number|null} Block filler offset or `null` if block filler is not needed.
function getFillerOffset() {
	const hasOnlyLists = !this.isEmpty && ( this.getChild( 0 ).name == 'ul' || this.getChild( 0 ).name == 'ol' );

	if ( this.isEmpty || hasOnlyLists ) {
		return 0;
	}

	const children = [ ...this.getChildren() ];
	const lastChild = children[ this.childCount - 1 ];

	// Block filler is required after a `<br>` if it's the last element in its container.
	// See: https://github.com/ckeditor/ckeditor5/issues/1312#issuecomment-436669045.
	if ( lastChild && lastChild.is( 'element', 'br' ) ) {
		return this.childCount;
	}

	return null;
}
