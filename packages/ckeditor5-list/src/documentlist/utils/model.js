/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist/utils/model
 */

import { uid } from 'ckeditor5/src/utils';
import ListWalker from './listwalker';

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
	const isForward = options.direction == 'forward';
	const includeNested = !!options.includeNested;

	const items = Array.from( new ListWalker( listItem, {
		direction: options.direction,
		biggerIndent: includeNested,
		includeSelf: isForward,
		sameIndent: true,
		sameItemId: true
	} ) );

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
	return Array.from( new ListWalker( listItem, {
		direction: 'forward',
		biggerIndent: true
	} ) );
}

/**
 * Check if the given block is the first in the list item.
 *
 * @protected
 * @param {module:engine/model/element~Element} listBlock The list block element.
 * @returns {Boolean}
 */
export function isFirstBlockOfListItem( listBlock ) {
	const previousSibling = ListWalker.first( listBlock, {
		direction: 'backward',
		sameIndent: true,
		sameItemId: true
	} );

	if ( !previousSibling ) {
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
	const nextSibling = ListWalker.first( listBlock, {
		direction: 'forward',
		sameIndent: true,
		sameItemId: true
	} );

	if ( !nextSibling ) {
		return true;
	}

	return false;
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
