/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/list/utils/view
 */

import type { DowncastWriter, ViewAttributeElement, ViewDocumentFragment, ViewElement, ViewNode } from 'ckeditor5/src/engine.js';
import { type ListType } from '../listediting.js';

/**
 * Checks if view element is a list type (ul or ol).
 *
 * @internal
 */
export function isListView( viewElement: ViewNode | ViewDocumentFragment ): viewElement is ViewElement & { name: 'ul' | 'ol' } {
	return viewElement.is( 'element', 'ol' ) || viewElement.is( 'element', 'ul' );
}

/**
 * Checks if view element is a list item (li).
 *
 * @internal
 */
export function isListItemView( viewElement: ViewNode | ViewDocumentFragment ): viewElement is ViewElement & { name: 'li' } {
	return viewElement.is( 'element', 'li' );
}

/**
 * Calculates the indent value for a list item. Handles HTML compliant and non-compliant lists.
 *
 * Also, fixes non HTML compliant lists indents:
 *
 * ```
 * before:                                     fixed list:
 * OL                                          OL
 * |-> LI (parent LIs: 0)                      |-> LI     (indent: 0)
 *     |-> OL                                  |-> OL
 *         |-> OL                                  |
 *         |   |-> OL                              |
 *         |       |-> OL                          |
 *         |           |-> LI (parent LIs: 1)      |-> LI (indent: 1)
 *         |-> LI (parent LIs: 1)                  |-> LI (indent: 1)
 *
 * before:                                     fixed list:
 * OL                                          OL
 * |-> OL                                      |
 *     |-> OL                                  |
 *          |-> OL                             |
 *              |-> LI (parent LIs: 0)         |-> LI        (indent: 0)
 *
 * before:                                     fixed list:
 * OL                                          OL
 * |-> LI (parent LIs: 0)                      |-> LI         (indent: 0)
 * |-> OL                                          |-> OL
 *     |-> LI (parent LIs: 0)                          |-> LI (indent: 1)
 * ```
 *
 * @internal
 */
export function getIndent( listItem: ViewElement ): number {
	let indent = 0;
	let parent = listItem.parent;

	while ( parent ) {
		// Each LI in the tree will result in an increased indent for HTML compliant lists.
		if ( isListItemView( parent ) ) {
			indent++;
		} else {
			// If however the list is nested in other list we should check previous sibling of any of the list elements...
			const previousSibling = ( parent as ViewElement ).previousSibling;

			// ...because the we might need increase its indent:
			//		before:                           fixed list:
			//		OL                                OL
			//		|-> LI (parent LIs: 0)            |-> LI         (indent: 0)
			//		|-> OL                                |-> OL
			//		    |-> LI (parent LIs: 0)                |-> LI (indent: 1)
			if ( previousSibling && isListItemView( previousSibling ) ) {
				indent++;
			}
		}

		parent = parent.parent;
	}

	return indent;
}

/**
 * Creates a list attribute element (ol or ul).
 *
 * @internal
 */
export function createListElement(
	writer: DowncastWriter,
	indent: number,
	type: ListType,
	id = getViewElementIdForListType( type, indent )
): ViewAttributeElement {
	// Negative priorities so that restricted editing attribute won't wrap lists.
	return writer.createAttributeElement( getViewElementNameForListType( type ), null, {
		priority: 2 * indent / 100 - 100,
		id
	} );
}

/**
 * Creates a list item attribute element (li).
 *
 * @internal
 */
export function createListItemElement(
	writer: DowncastWriter,
	indent: number,
	id: string
): ViewAttributeElement {
	// Negative priorities so that restricted editing attribute won't wrap list items.
	return writer.createAttributeElement( 'li', null, {
		priority: ( 2 * indent + 1 ) / 100 - 100,
		id
	} );
}

/**
 * Returns a view element name for the given list type.
 *
 * @internal
 */
export function getViewElementNameForListType( type?: ListType ): 'ol' | 'ul' {
	return type == 'numbered' || type == 'customNumbered' ? 'ol' : 'ul';
}

/**
 * Returns a view element ID for the given list type and indent.
 *
 * @internal
 */
export function getViewElementIdForListType( type?: ListType, indent?: number ): string {
	return `list-${ type }-${ indent }`;
}
