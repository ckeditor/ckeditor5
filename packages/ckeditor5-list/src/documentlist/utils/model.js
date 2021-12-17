/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/utils/model
 */

import { uid } from 'ckeditor5/src/utils';

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
export function getSiblingListBlock( modelElement, options ) {
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

		if ( itemIndent > indent ) {
			continue;
		}

		if ( sameIndent && itemIndent == indent ) {
			return item;
		}

		if ( itemIndent < indent ) {
			return smallerIndent ? item : null;
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
export function getAllListItemBlocks( listItem ) {
	return [
		...getListItemBlocks( listItem, { direction: 'backward' } ),
		...getListItemBlocks( listItem, { direction: 'forward' } )
	];
}

/**
 * Returns an array with elements that represents the same list item in the specified direction.
 *
 * It means that values for `listIndent` and `listItemId` for all items are equal.
 *
 * **Note**: For backward search the provided item is not included, but for forward search it is included in the result.
 *
 * @protected
 * @param {module:engine/model/element~Element} listItem Starting list item element.
 * @param {Object} [options]
 * @param {'forward'|'backward'} [options.direction='backward'] Walking direction.
 * @param {Boolean} [options.includeNested=false] Whether nested blocks should be included.
 * @returns {Array.<module:engine/model/element~Element>}
 */
export function getListItemBlocks( listItem, options = {} ) {
	const limitIndent = listItem.getAttribute( 'listIndent' );
	const listItemId = listItem.getAttribute( 'listItemId' );
	const isForward = options.direction == 'forward';
	const includeNested = !!options.includeNested;
	const items = [];
	const nestedItems = [];

	// TODO use generator instead of for loop (ListWalker)
	for (
		let item = isForward ? listItem : listItem.previousSibling;
		item && item.hasAttribute( 'listItemId' );
		item = isForward ? item.nextSibling : item.previousSibling
	) {
		const itemIndent = item.getAttribute( 'listIndent' );

		// If current parsed item has lower indent that element that the element that was a starting point,
		// it means we left a nested list. Abort searching items.
		if ( itemIndent < limitIndent ) {
			break;
		}

		if ( itemIndent > limitIndent ) {
			// Ignore nested lists.
			if ( !includeNested ) {
				continue;
			}

			// Collect nested items to verify if they are really nested, or it's a different item.
			if ( !isForward ) {
				nestedItems.push( item );

				continue;
			}
		}

		// Abort if item has a different ID.
		if ( itemIndent == limitIndent && item.getAttribute( 'listItemId' ) != listItemId ) {
			break;
		}

		// There is another block for the same list item so the nested items were in the same list item.
		if ( nestedItems.length ) {
			items.push( ...nestedItems );
			nestedItems.length = 0;
		}

		items.push( item );
	}

	return isForward ? items : items.reverse();
}

/**
 * Returns a list items nested inside the given list item.
 *
 * @protected
 * @param {module:engine/model/element~Element} listItem Starting list item element.
 * @returns {Array.<module:engine/model/element~Element>}
 */
export function getNestedListBlocks( listItem ) {
	const indent = listItem.getAttribute( 'listIndent' );
	const items = [];

	for (
		let item = listItem.nextSibling;
		item && item.hasAttribute( 'listItemId' );
		item = item.nextSibling
	) {
		if ( item.getAttribute( 'listIndent' ) <= indent ) {
			break;
		}

		items.push( item );
	}

	return items;
}

/**
 * Check if the given block is the first in the list item.
 *
 * @protected
 * @param {module:engine/model/element~Element} listBlock The list block element.
 * @returns {Boolean}
 */
export function isFirstBlockOfListItem( listBlock ) {
	const previousSibling = getSiblingListBlock( listBlock.previousSibling, {
		listIndent: listBlock.getAttribute( 'listIndent' ),
		sameIndent: true
	} );

	if ( !previousSibling ) {
		return true;
	}

	if ( previousSibling.getAttribute( 'listItemId' ) != listBlock.getAttribute( 'listItemId' ) ) {
		return true;
	}

	return false;
}

/**
 * Check if the given block is the last in the list item.
 *
 * @protected
 * @param {module:engine/model/element~Element} listBlock The list block element.
 * @returns {Boolean}
 */
export function isLastBlockOfListItem( listBlock ) {
	const nextSibling = getSiblingListBlock( listBlock.nextSibling, {
		listIndent: listBlock.getAttribute( 'listIndent' ),
		direction: 'forward',
		sameIndent: true
	} );

	if ( !nextSibling ) {
		return true;
	}

	return nextSibling.getAttribute( 'listItemId' ) != listBlock.getAttribute( 'listItemId' );
}

/**
 * Expands the given list of selected blocks to include the leading and tailing blocks of partially selected list items.
 *
 * @protected
 * @param {Array.<module:engine/model/element~Element>} blocks The list of selected blocks.
 */
export function expandListBlocksToCompleteItems( blocks ) {
	const firstBlock = blocks[ 0 ];
	const lastBlock = blocks[ blocks.length - 1 ];

	// Add missing blocks of the first selected list item.
	blocks.splice( 0, 0, ...getListItemBlocks( firstBlock, { direction: 'backward', includeNested: true } ) );

	// Add missing blocks of the last selected list item.
	for ( const item of getListItemBlocks( lastBlock, { direction: 'forward', includeNested: true } ) ) {
		if ( item != lastBlock ) {
			blocks.push( item );
		}
	}
}

/**
 * Splits the list item just before the provided list block.
 *
 * @protected
 * @param {module:engine/model/element~Element} listBlock The list block element.
 * @param {module:engine/model/writer~Writer} writer The model writer.
 */
export function splitListItemBefore( listBlock, writer ) {
	const id = uid();

	for ( const item of getListItemBlocks( listBlock, { direction: 'forward' } ) ) {
		writer.setAttribute( 'listItemId', id, item );
	}
}

/**
 * Updates indentation of given list blocks.
 *
 * @protected
 * @param {Array.<module:engine/model/element~Element>} blocks The list of selected blocks.
 * @param {Number} indentBy The indentation level difference.
 * @param {module:engine/model/writer~Writer} writer The model writer.
 */
export function indentBlocks( blocks, indentBy, writer ) {
	for ( const item of blocks ) {
		const indent = item.getAttribute( 'listIndent' ) + indentBy;

		if ( indent < 0 ) {
			for ( const attributeKey of item.getAttributeKeys() ) {
				if ( attributeKey.startsWith( 'list' ) ) {
					writer.removeAttribute( attributeKey, item );
				}
			}
		} else {
			writer.setAttribute( 'listIndent', indent, item );
		}
	}
}
