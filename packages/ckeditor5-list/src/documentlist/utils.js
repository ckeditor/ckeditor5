/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { TreeWalker } from 'ckeditor5/src/engine';

/**
 * @module list/documentlist/utils
 */

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
		if ( parent.is( 'element', 'li' ) ) {
			indent++;
		} else if ( parent.is( 'element', 'ul' ) || parent.is( 'element', 'ol' ) ) {
			// If however the list is nested in other list we should check previous sibling of any of the list elements...
			const previousSibling = parent.previousSibling;

			// ...because the we might need increase its indent:
			//		before:                           fixed list:
			//		OL                                OL
			//		|-> LI (parent LIs: 0)            |-> LI         (indent: 0)
			//		|-> OL                                |-> OL
			//		    |-> LI (parent LIs: 0)                |-> LI (indent: 1)
			if ( previousSibling && previousSibling.is( 'element', 'li' ) ) {
				indent++;
			}
		} else {
			break;
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
	return writer.createAttributeElement( type == 'numbered' ? 'ol' : 'ul', null, {
		priority: 2 * indent - 100,
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
		priority: ( 2 * indent + 1 ) - 100,
		id
	} );
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
 * Returns an array with all elements that represents the same list item.
 *
 * It means that values for `listIndent`, `listType`, `listStyle`, and `listItemId` for all items are equal.
 *
 * @param {module:engine/model/element~Element} listItem Starting list item element.
 * @param {module:engine/model/model~Model} model The editor model.
 * @param {'forward'|'backward'} [direction='forward'] Walking direction.
 * @returns {Array.<module:engine/model/element~Element>}
 */
export function getListItemElements( listItem, model, direction = 'forward' ) {
	const walkerOptions = {
		ignoreElementEnd: true,
		startPosition: model.createPositionBefore( listItem ),
		shallow: true,
		direction
	};

	const items = [];
	const limitIndent = listItem.getAttribute( 'listIndent' );
	const listItemId = listItem.getAttribute( 'listItemId' );

	for ( const { item } of new TreeWalker( walkerOptions ) ) {
		if ( !item.is( 'element' ) || !item.hasAttribute( 'listItemId' ) ) {
			break;
		}

		// If current parsed item has lower indent that element that the element that was a starting point,
		// it means we left a nested list. Abort searching items.
		//
		// ■ List item 1.       [listIndent=0]
		//     ○ List item 2.[] [listIndent=1], limitIndent = 1,
		//     ○ List item 3.   [listIndent=1]
		// ■ List item 4.       [listIndent=0]
		//
		// Abort searching when leave nested list.
		if ( item.getAttribute( 'listIndent' ) < limitIndent ) {
			break;
		}

		// ■ List item 1.[]     [listIndent=0] limitIndent = 0,
		//     ○ List item 2.   [listIndent=1]
		//     ○ List item 3.   [listIndent=1]
		// ■ List item 4.       [listIndent=0]
		//
		// Ignore nested lists.
		if ( item.getAttribute( 'listIndent' ) > limitIndent ) {
			continue;
		}

		// ■ List item 1.[]  [listType=bulleted]
		// 1. List item 2.   [listType=numbered]
		// 2.List item 3.    [listType=numbered]
		//
		// Abort searching when found a different kind of a list.
		if ( item.getAttribute( 'listType' ) !== listItem.getAttribute( 'listType' ) ) {
			break;
		}

		// ■ List item 1.[]  [listType=bulleted]
		// ■ List item 2.    [listType=bulleted]
		// ○ List item 3.    [listType=bulleted]
		// ○ List item 4.    [listType=bulleted]
		//
		// Abort searching when found a different list style.
		if ( item.getAttribute( 'listStyle' ) !== listItem.getAttribute( 'listStyle' ) ) {
			break;
		}

		if ( item.getAttribute( 'listItemId' ) == listItemId ) {
			if ( direction == 'backward' ) {
				items.unshift( item );
			} else {
				items.push( item );
			}
		}
	}

	return items;
}
