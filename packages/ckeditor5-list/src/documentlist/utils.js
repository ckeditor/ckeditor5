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
 * @protected
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
*/
export function isListView( viewElement ) {
	return viewElement.is( 'element', 'ol' ) || viewElement.is( 'element', 'ul' );
}

/**
 * Checks if view element is a list item (li).
 *
 * @protected
 * @param {module:engine/view/element~Element} viewElement
 * @returns {Boolean}
 */
export function isListItemView( viewElement ) {
	return viewElement.is( 'element', 'li' );
}

/**
 * Calculates the indent value for a list item. Handles HTML compliant and non-compliant lists.
 *
 * Also, fixes non HTML compliant lists indents:
 *
 * 		before:                                     fixed list:
 * 		OL                                          OL
 * 		|-> LI (parent LIs: 0)                      |-> LI     (indent: 0)
 * 		    |-> OL                                  |-> OL
 * 		        |-> OL                                  |
 * 		        |   |-> OL                              |
 * 		        |       |-> OL                          |
 * 		        |           |-> LI (parent LIs: 1)      |-> LI (indent: 1)
 * 		        |-> LI (parent LIs: 1)                  |-> LI (indent: 1)
 *
 * 		before:                                     fixed list:
 * 		OL                                          OL
 * 		|-> OL                                      |
 * 		    |-> OL                                  |
 * 		         |-> OL                             |
 * 		             |-> LI (parent LIs: 0)         |-> LI        (indent: 0)
 *
 * 		before:                                     fixed list:
 * 		OL                                          OL
 * 		|-> LI (parent LIs: 0)                      |-> LI         (indent: 0)
 * 		|-> OL                                          |-> OL
 * 		    |-> LI (parent LIs: 0)                          |-> LI (indent: 1)
 *
 * @protected
 * @param {module:engine/view/element~Element} listItem
 * @returns {Number}
 */
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
 * Creates a list attribute element (ol or ul).
 *
 * @protected
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The downcast writer.
 * @param {Number} indent The list item indent.
 * @param {'bulleted'|'numbered'} type The list type.
 * @param {String} [id] The list ID.
 * @returns {module:engine/view/attributeelement~AttributeElement}
 */
export function createListElement( writer, indent, type, id ) {
	// Negative priorities so that restricted editing attribute won't wrap lists.
	return writer.createAttributeElement( getViewElementNameForListType( type ), null, {
		priority: 2 * indent / 100 - 100,
		id
	} );
}

/**
 * Creates a list item attribute element (li).
 *
 * @protected
 * @param {module:engine/view/downcastwriter~DowncastWriter} writer The downcast writer.
 * @param {Number} indent The list item indent.
 * @param {String} id The list item ID.
 * @returns {module:engine/view/attributeelement~AttributeElement}
 */
export function createListItemElement( writer, indent, id ) {
	// Negative priorities so that restricted editing attribute won't wrap list items.
	return writer.createAttributeElement( 'li', null, {
		priority: ( 2 * indent + 1 ) / 100 - 100,
		id
	} );
}

/**
 * Returns a view element name for the given list type.
 *
 * @protected
 * @param {'bulleted'|'numbered'} type The list type.
 * @returns {String}
 */
export function getViewElementNameForListType( type ) {
	return type == 'numbered' ? 'ol' : 'ul';
}

/**
 * Returns the closest list item model element according to the specified options.
 *
 * Note that if the provided model element satisfies the provided options then it's returned.
 *
 * @protected
 * @param {module:engine/model/element~Element} modelElement
 * @param {Object} options
 * @param {Number} options.listIndent The reference list indent.
 * @param {Boolean} [options.sameIndent=false] Whether to return list item model element with the same indent as specified.
 * @param {Boolean} [options.smallerIndent=false] Whether to return list item model element with the smaller indent as specified.
 * @param {'forward'|'backward'} [options.direction='backward'] The search direction.
 * @return {module:engine/model/element~Element|null}
 */
export function getSiblingListItem( modelElement, options ) {
	const sameIndent = !!options.sameIndent;
	const smallerIndent = !!options.smallerIndent;
	const indent = options.listIndent;
	const isForward = options.direction == 'forward';

	for (
		let item = modelElement;
		item && item.hasAttribute( 'listItemId' );
		item = isForward ? item.nextSibling : item.previousSibling
	) {
		const itemIndent = item.getAttribute( 'listIndent' );

		if ( sameIndent && itemIndent == indent ) {
			return item;
		}

		if ( smallerIndent && itemIndent < indent ) {
			return item;
		}
	}

	return null;
}

/**
 * Returns an array with all elements that represents the same list item.
 *
 * It means that values for `listIndent`, and `listItemId` for all items are equal.
 *
 * @protected
 * @param {module:engine/model/element~Element} listItem Starting list item element.
 * @return {Array.<module:engine/model/element~Element>}
 */
export function getAllListItemElements( listItem ) {
	return [
		...getListItemElements( listItem, 'backward' ),
		...getListItemElements( listItem, 'forward' )
	];
}

/**
 * Returns an array with elements that represents the same list item in the specified direction.
 *
 * It means that values for `listIndent`, and `listItemId` for all items are equal.
 *
 * **Note**: For backward search the provided item is not included, but for forward search it is included in the result.
 *
 * @protected
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

/**
 * Based on the provided positions looks for the list head and stores it in the provided map.
 *
 * @protected
 * @param {module:engine/model/position~Position} position The search starting position.
 * @param {Map.<module:engine/model/element~Element,module:engine/model/element~Element>} itemToListHead The map from list item element
 * to the list head element.
 */
export function findAndAddListHeadToMap( position, itemToListHead ) {
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

/**
 * Scans the list starting from the given list head element and fixes items' indentation.
 *
 * @protected
 * @param {module:engine/model/element~Element} listHead The list head model element.
 * @param {module:engine/model/writer~Writer} writer The model writer.
 * @returns {Boolean} Whether the model was modified.
 */
export function fixListIndents( listHead, writer ) {
	let maxIndent = 0; // Guards local sublist max indents that need fixing.
	let prevIndent = -1; // Previous item indent.
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

			if ( newIndent > prevIndent + 1 ) {
				newIndent = prevIndent + 1;
			}

			writer.setAttribute( 'listIndent', newIndent, item );

			applied = true;
			prevIndent = newIndent;
		} else {
			fixBy = null;
			maxIndent = itemIndent + 1;
			prevIndent = itemIndent;
		}
	}

	return applied;
}

/**
 * Scans the list starting from the given list head element and fixes items' types.
 *
 * @protected
 * @param {module:engine/model/element~Element} listHead The list head model element.
 * @param {Set.<String>} seenIds The set of already known IDs.
 * @param {module:engine/model/writer~Writer} writer The model writer.
 * @returns {Boolean} Whether the model was modified.
 */
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
