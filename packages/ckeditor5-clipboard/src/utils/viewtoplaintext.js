/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/utils/viewtoplaintext
 */

// Elements which should not have empty-line padding.
// Most `view.ContainerElement` want to be separate by new-line, but some are creating one structure
// together (like `<li>`) so it is better to separate them by only one "\n".
const smallPaddingElements = [ 'figcaption', 'li' ];

/**
 * Converts {@link module:engine/view/item~Item view item} and all of its children to plain text.
 *
 * @param {module:engine/view/item~Item} viewItem View item to convert.
 * @returns {String} Plain text representation of `viewItem`.
 */
export default function viewToPlainText( viewItem ) {
	let text = '';

	if ( viewItem.is( '$text' ) || viewItem.is( '$textProxy' ) ) {
		// If item is `Text` or `TextProxy` simple take its text data.
		text = viewItem.data;
	} else if ( viewItem.is( 'element', 'img' ) && viewItem.hasAttribute( 'alt' ) ) {
		// Special case for images - use alt attribute if it is provided.
		text = viewItem.getAttribute( 'alt' );
	} else {
		// Other elements are document fragments, attribute elements or container elements.
		// They don't have their own text value, so convert their children.
		let prev = null;

		for ( const child of viewItem.getChildren() ) {
			const childText = viewToPlainText( child );

			// Separate container element children with one or more new-line characters.
			if ( prev && ( prev.is( 'containerElement' ) || child.is( 'containerElement' ) ) ) {
				if ( smallPaddingElements.includes( prev.name ) || smallPaddingElements.includes( child.name ) ) {
					text += '\n';
				} else {
					text += '\n\n';
				}
			}

			text += childText;
			prev = child;
		}
	}

	return text;
}
