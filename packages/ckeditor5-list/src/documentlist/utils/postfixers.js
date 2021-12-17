/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/utils/postfixers
 */

import { uid } from 'ckeditor5/src/utils';
import { getListItemBlocks } from './model';

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

		for ( const block of getListItemBlocks( item, { direction: 'forward' } ) ) {
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
