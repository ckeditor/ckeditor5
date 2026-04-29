/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/bookmark
 */

import type {
	ViewUpcastWriter,
	ViewDocumentFragment,
	ViewElement
} from '@ckeditor/ckeditor5-engine';

/**
 * Transforms `<a>` elements which are bookmarks by moving their children after the element.
 *
 * @internal
 */
export function transformBookmarks(
	documentFragment: ViewDocumentFragment,
	writer: ViewUpcastWriter
): void {
	const elementsToChange = [];

	for ( const value of writer.createRangeIn( documentFragment ) ) {
		const element = value.item;

		if (
			element.is( 'element', 'a' ) &&
			!element.hasAttribute( 'href' ) &&
			( element.hasAttribute( 'id' ) || element.hasAttribute( 'name' ) ) )
		{
			elementsToChange.push( element );
		}
	}

	for ( const element of elementsToChange ) {
		const index = element.parent!.getChildIndex( element ) + 1;
		const children = element.getChildren();

		writer.insertChild( index, children, element.parent! );

		if ( isHiddenBookmarkAnchor( element ) ) {
			writer.remove( element );
		}
	}
}

/**
 * Checks whether the given element is a hidden or auto-generated bookmark anchor.
 *
 * Editors like MS Word and Google Docs use the `name` attribute (rather than `id`)
 * for bookmarks. Furthermore, they reserve `_`-prefixed bookmark names for
 * auto-generated anchors (e.g., Table of Contents or internal hyperlinks) and
 * do not allow users to manually create custom bookmarks starting with an underscore.
 *
 * @param element The element to check.
 * @returns True if the element is a hidden bookmark anchor, false otherwise.
 */
function isHiddenBookmarkAnchor( element: ViewElement ) {
	const name = element.getAttribute( 'name' );

	return !!name && name.startsWith( '_' );
}
