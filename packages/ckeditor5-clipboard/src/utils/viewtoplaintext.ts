/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/utils/viewtoplaintext
 */

import type { ViewDocumentFragment, ViewElement, ViewItem } from '@ckeditor/ckeditor5-engine';

// Elements which should not have empty-line padding.
// Most `view.ContainerElement` want to be separate by new-line, but some are creating one structure
// together (like `<li>`) so it is better to separate them by only one "\n".
const smallPaddingElements = [ 'figcaption', 'li' ];

const listElements = [ 'ol', 'ul' ];

/**
 * Converts {@link module:engine/view/item~Item view item} and all of its children to plain text.
 *
 * @param viewItem View item to convert.
 * @returns Plain text representation of `viewItem`.
 */
export default function viewToPlainText( viewItem: ViewItem | ViewDocumentFragment ): string {
	if ( viewItem.is( '$text' ) || viewItem.is( '$textProxy' ) ) {
		return viewItem.data;
	}

	if ( viewItem.is( 'element', 'img' ) && viewItem.hasAttribute( 'alt' ) ) {
		return viewItem.getAttribute( 'alt' )!;
	}

	if ( viewItem.is( 'element', 'br' ) ) {
		return '\n'; // Convert soft breaks to single line break (#8045).
	}

	/**
	 * Item is a document fragment, attribute element or container element. It doesn't
	 * have it's own text value, so we need to convert its children elements.
	 */

	let text = '';
	let prev: ViewElement | null = null;

	for ( const child of ( viewItem as ViewElement | ViewDocumentFragment ).getChildren() ) {
		text += newLinePadding( child as ViewElement, prev ) + viewToPlainText( child );
		prev = child as ViewElement;
	}

	return text;
}

/**
 * Returns new line padding to prefix the given elements with.
 */
function newLinePadding(
	element: ViewElement,
	previous: ViewElement | null
): string {
	if ( !previous ) {
		// Don't add padding to first elements in a level.
		return '';
	}

	if ( element.is( 'element', 'li' ) && !element.isEmpty && element.getChild( 0 )!.is( 'containerElement' ) ) {
		// Separate document list items with empty lines.
		return '\n\n';
	}

	if ( listElements.includes( element.name ) && listElements.includes( previous.name ) ) {
		/**
		 * Because `<ul>` and `<ol>` are AttributeElements, two consecutive lists will not have any padding between
		 * them (see the `if` statement below). To fix this, we need to make an exception for this case.
		 */
		return '\n\n';
	}

	if ( !element.is( 'containerElement' ) && !previous.is( 'containerElement' ) ) {
		// Don't add padding between non-container elements.
		return '';
	}

	if ( smallPaddingElements.includes( element.name ) || smallPaddingElements.includes( previous.name ) ) {
		// Add small padding between selected container elements.
		return '\n';
	}

	// Do not add padding around the elements that won't be rendered.
	if (
		element.is( 'element' ) && element.getCustomProperty( 'dataPipeline:transparentRendering' ) ||
		previous.is( 'element' ) && previous.getCustomProperty( 'dataPipeline:transparentRendering' )
	) {
		return '';
	}

	// Add empty lines between container elements.
	return '\n\n';
}
