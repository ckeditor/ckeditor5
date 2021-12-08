/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { uid } from 'ckeditor5/src/utils';

/**
 * @module list/documentlist/utils
 */

/**
 * Checks if view element is a list type (ul or ol).
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
*/
export function isListView( viewElement ) {
	return viewElement.is( 'element', 'ol' ) || viewElement.is( 'element', 'ul' );
}

/**
 * Checks if view element is a list item (li).
 *
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isListItemView( viewElement ) {
	return viewElement.is( 'element', 'li' );
}

// Calculates the indent value for a list item. Handles HTML compliant and non-compliant lists.
//
// Also, fixes non HTML compliant lists indents:
//
//		before:                                     fixed list:
//		OL                                          OL
//		|-> LI (parent LIs: 0)                      |-> LI     (indent: 0)
//		    |-> OL                                  |-> OL
//		        |-> OL                                  |
//		        |   |-> OL                              |
//		        |       |-> OL                          |
//		        |           |-> LI (parent LIs: 1)      |-> LI (indent: 1)
//		        |-> LI (parent LIs: 1)                  |-> LI (indent: 1)
//
//		before:                                     fixed list:
//		OL                                          OL
//		|-> OL                                      |
//		    |-> OL                                  |
//		         |-> OL                             |
//		             |-> LI (parent LIs: 0)         |-> LI        (indent: 0)
//
//		before:                                     fixed list:
//		OL                                          OL
//		|-> LI (parent LIs: 0)                      |-> LI         (indent: 0)
//		|-> OL                                          |-> OL
//		    |-> LI (parent LIs: 0)                          |-> LI (indent: 1)
//
// @param {module:engine/view/element~Element} listItem
// @returns {Number}
export function getIndent( listItem ) {
	let indent = 0;
	let parent = listItem.parent;

	while ( parent ) {
		// Each LI in the tree will result in an increased indent for HTML compliant lists.
		if ( isListItemView( parent ) ) {
			indent++;
		} else {
			// If however the list is nested in other list we should check previous sibling of any of the list elements...
			const previousSibling = parent.previousSibling;

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
 * TODO
 *
 * @param writer
 * @param indent
 * @param type
 * @param id
 * @returns {module:engine/view/attributeelement~AttributeElement|any}
 */
export function createListElement( writer, indent, type, id ) {
	// Negative priorities so that restricted editing attribute won't wrap lists.
	return writer.createAttributeElement( getViewElementNameForListType( type ), null, {
		priority: 2 * indent / 100 - 100,
		id
	} );
}

/**
 * TODO
 *
 * @param writer
 * @param indent
 * @param id
 * @returns {module:engine/view/attributeelement~AttributeElement|any}
 */
export function createListItemElement( writer, indent, id ) {
	// Negative priorities so that restricted editing attribute won't wrap list items.
	return writer.createAttributeElement( 'li', null, {
		priority: ( 2 * indent + 1 ) / 100 - 100,
		id
	} );
}

/**
 * TODO
 */
export function getViewElementNameForListType( type ) {
	return type == 'numbered' ? 'ol' : 'ul';
}

/**
 * TODO
 *
 * @param modelItem
 * @param options
 * @returns {ChildNode|null}
 */
export function getSiblingListItem( modelItem, options ) {
	const sameIndent = !!options.sameIndent;
	const smallerIndent = !!options.smallerIndent;
	const indent = options.listIndent;

	let item = modelItem;

	while ( item && item.hasAttribute( 'listItemId' ) ) {
		const itemIndent = item.getAttribute( 'listIndent' );

		if ( ( sameIndent && indent == itemIndent ) || ( smallerIndent && indent > itemIndent ) ) {
			return item;
		}

		if ( options.direction === 'forward' ) {
			item = item.nextSibling;
		} else {
			item = item.previousSibling;
		}
	}

	return null;
}

/**
 * TODO
 *
 * @param listItem
 * @return {module:engine/model/element~Element[]}
 */
export function getAllListItemElements( listItem ) {
	return [
		...getListItemElements( listItem, 'backward' ),
		...getListItemElements( listItem, 'forward' )
	];
}

/**
 * Returns an array with all elements that represents the same list item.
 *
 * It means that values for `listIndent`, `listType`, `listStyle`, and `listItemId` for all items are equal.
 *
 * @param {module:engine/model/element~Element} listItem Starting list item element.
 * @param {'forward'|'backward'} direction Walking direction.
 * @returns {Array.<module:engine/model/element~Element>}
 */
export function getListItemElements( listItem, direction ) {
	const limitIndent = listItem.getAttribute( 'listIndent' );
	const listItemId = listItem.getAttribute( 'listItemId' );
	const isForward = direction == 'forward';
	const items = [];

	for (
		let item = isForward ? listItem : listItem.previousSibling;
		item && item.hasAttribute( 'listItemId' );
		item = isForward ? item.nextSibling : item.previousSibling
	) {
		// If current parsed item has lower indent that element that the element that was a starting point,
		// it means we left a nested list. Abort searching items.
		if ( item.getAttribute( 'listIndent' ) < limitIndent ) {
			break;
		}

		// Ignore nested lists.
		if ( item.getAttribute( 'listIndent' ) > limitIndent ) {
			continue;
		}

		// Abort if item has a different ID.
		if ( item.getAttribute( 'listItemId' ) != listItemId ) {
			break;
		}

		items.push( item );
	}

	return isForward ? items : items.reverse();
}

// TODO
export function findAddListHeadToMap( position, itemToListHead ) {
	const previousNode = position.nodeBefore;

	if ( !previousNode || !previousNode.hasAttribute( 'listItemId' ) ) {
		const item = position.nodeAfter;

		if ( item && item.hasAttribute( 'listItemId' ) ) {
			itemToListHead.set( item, item );
		}
	} else {
		let listHead = previousNode;

		if ( itemToListHead.has( listHead ) ) {
			return;
		}

		for (
			// Cache previousSibling and reuse for performance reasons. See #6581.
			let previousSibling = listHead.previousSibling;
			previousSibling && previousSibling.hasAttribute( 'listItemId' );
			previousSibling = listHead.previousSibling
		) {
			listHead = previousSibling;

			if ( itemToListHead.has( listHead ) ) {
				return;
			}
		}

		itemToListHead.set( previousNode, listHead );
	}
}

// TODO
export function fixListIndents( listHead, writer ) {
	let maxIndent = 0;
	let fixBy = null;
	let applied = false;

	for (
		let item = listHead;
		item && item.hasAttribute( 'listItemId' );
		item = item.nextSibling
	) {
		const itemIndent = item.getAttribute( 'listIndent' );

		if ( itemIndent > maxIndent ) {
			let newIndent;

			if ( fixBy === null ) {
				fixBy = itemIndent - maxIndent;
				newIndent = maxIndent;
			} else {
				if ( fixBy > itemIndent ) {
					fixBy = itemIndent;
				}

				newIndent = itemIndent - fixBy;
			}

			writer.setAttribute( 'listIndent', newIndent, item );

			applied = true;
		} else {
			fixBy = null;
			maxIndent = item.getAttribute( 'listIndent' ) + 1;
		}
	}

	return applied;
}

// TODO
export function fixListItemIds( listHead, seenIds, writer ) {
	const visited = new Set();
	let applied = false;

	for (
		let item = listHead;
		item && item.hasAttribute( 'listItemId' );
		item = item.nextSibling
	) {
		if ( visited.has( item ) ) {
			continue;
		}

		let listType = item.getAttribute( 'listType' );
		let listItemId = item.getAttribute( 'listItemId' );

		// Use a new ID if this one was spot earlier (even in other list).
		if ( seenIds.has( listItemId ) ) {
			listItemId = uid();
		}

		seenIds.add( listItemId );

		for ( const block of getListItemElements( item, 'forward' ) ) {
			visited.add( block );

			// Use a new ID if a block of a bigger list item has different type.
			if ( block.getAttribute( 'listType' ) != listType ) {
				listItemId = uid();
				listType = block.getAttribute( 'listType' );
			}

			if ( block.getAttribute( 'listItemId' ) != listItemId ) {
				writer.setAttribute( 'listItemId', listItemId, block );

				applied = true;
			}
		}
	}

	return applied;
}
