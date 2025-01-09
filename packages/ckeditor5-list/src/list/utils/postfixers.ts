/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/list/utils/postfixers
 */

import type { Element, Position, Writer } from 'ckeditor5/src/engine.js';
import { SiblingListBlocksIterator, type ListIteratorValue } from './listwalker.js';
import { getListItemBlocks, isListItemBlock, ListItemUid, type ListElement } from './model.js';

/**
 * Based on the provided positions looks for the list head and stores it in the provided map.
 *
 * @internal
 * @param position The search starting position.
 * @param itemToListHead The map from list item element to the list head element.
 * @param visited A set of elements that were already visited.
 */
export function findAndAddListHeadToMap(
	position: Position,
	itemToListHead: Set<ListElement>,
	visited: Set<Element>
): void {
	const previousNode = position.nodeBefore;

	if ( !isListItemBlock( previousNode ) ) {
		const item = position.nodeAfter;

		if ( isListItemBlock( item ) ) {
			itemToListHead.add( item );
		}
	} else {
		let listHead = previousNode;

		// Previously, the loop below was defined like this:
		//
		// 		for ( { node: listHead } of new SiblingListBlocksIterator( listHead, 'backward' ) )
		//
		// Unfortunately, such a destructuring is incorrectly transpiled by Babel and the loop never ends.
		// See: https://github.com/ckeditor/ckeditor5-react/issues/345.
		for ( const { node } of new SiblingListBlocksIterator( listHead, 'backward' ) ) {
			listHead = node;

			if ( visited.has( listHead ) ) {
				return;
			}

			visited.add( listHead );

			if ( itemToListHead.has( previousNode ) ) {
				return;
			}
		}

		itemToListHead.add( listHead );
	}
}

/**
 * Scans the list starting from the given list head element and fixes items' indentation.
 *
 * @internal
 * @param listNodes The iterable of list nodes.
 * @param writer The model writer.
 * @returns Whether the model was modified.
 */
export function fixListIndents(
	listNodes: Iterable<ListIteratorValue>,
	writer: Writer
): boolean {
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
 * @internal
 * @param listNodes The iterable of list nodes.
 * @param seenIds The set of already known IDs.
 * @param writer The model writer.
 * @returns Whether the model was modified.
 */
export function fixListItemIds(
	listNodes: Iterable<ListIteratorValue>,
	seenIds: Set<string>,
	writer: Writer
): boolean {
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

		// Make sure that all items in a simple list have unique IDs.
		if ( node.is( 'element', 'listItem' ) ) {
			if ( node.getAttribute( 'listItemId' ) != listItemId ) {
				writer.setAttribute( 'listItemId', listItemId, node );

				applied = true;
			}

			continue;
		}

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
