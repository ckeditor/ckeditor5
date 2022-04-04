/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/utils/postfixers
 */

import { iterateSiblingListBlocks } from './listwalker';
import { getListItemBlocks, isListItemBlock, ListItemUid } from './model';

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

	if ( !isListItemBlock( previousNode ) ) {
		const item = position.nodeAfter;

		if ( isListItemBlock( item ) ) {
			itemToListHead.set( item, item );
		}
	} else {
		let listHead = previousNode;

		for ( { node: listHead } of iterateSiblingListBlocks( listHead, 'backward' ) ) {
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
 * @param {Iterable.<module:list/documentlist/utils/listwalker~ListIteratorValue>} listNodes The iterable of list nodes.
 * @param {module:engine/model/writer~Writer} writer The model writer.
 * @returns {Boolean} Whether the model was modified.
 */
export function fixListIndents( listNodes, writer ) {
	let maxIndent = 0; // Guards local sublist max indents that need fixing.
	let prevIndent = -1; // Previous item indent.
	let fixBy = null;
	let applied = false;

	for ( const { node } of listNodes ) {
		const itemIndent = node.getAttribute( 'listIndent' );

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

			writer.setAttribute( 'listIndent', newIndent, node );

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
 * @param {Iterable.<module:list/documentlist/utils/listwalker~ListIteratorValue>} listNodes The iterable of list nodes.
 * @param {Set.<String>} seenIds The set of already known IDs.
 * @param {module:engine/model/writer~Writer} writer The model writer.
 * @returns {Boolean} Whether the model was modified.
 */
export function fixListItemIds( listNodes, seenIds, writer ) {
	const visited = new Set();
	let applied = false;

	for ( const { node } of listNodes ) {
		if ( visited.has( node ) ) {
			continue;
		}

		let listType = node.getAttribute( 'listType' );
		let listItemId = node.getAttribute( 'listItemId' );

		// Use a new ID if this one was spot earlier (even in other list).
		if ( seenIds.has( listItemId ) ) {
			listItemId = ListItemUid.next();
		}

		seenIds.add( listItemId );

		for ( const block of getListItemBlocks( node, { direction: 'forward' } ) ) {
			visited.add( block );

			// Use a new ID if a block of a bigger list item has different type.
			if ( block.getAttribute( 'listType' ) != listType ) {
				listItemId = ListItemUid.next();
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
