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
 * @param {Object} options TODO
 * @return {Array.<module:engine/model/element~Element>}
 */
export function getAllListItemBlocks( listItem, options = {} ) {
	return [
		...getListItemBlocks( listItem, { ...options, direction: 'backward' } ),
		...getListItemBlocks( listItem, { ...options, direction: 'forward' } )
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
 * TODO all options
 * @returns {Array.<module:engine/model/element~Element>}
 */
export function getListItemBlocks( listItem, options = {} ) {
	const isForward = options.direction == 'forward';

	const items = Array.from( new ListWalker( listItem, {
		...options,
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
 * @returns {Array.<module:engine/model/element~Element>}
 */
export function expandListBlocksToCompleteItems( blocks ) {
	const allBlocks = new Set();

	for ( const block of blocks ) {
		for ( const itemBlock of getAllListItemBlocks( block, { biggerIndent: true } ) ) {
			allBlocks.add( itemBlock );
		}
	}

	return Array.from( allBlocks.values() ).sort( ( a, b ) => a.index - b.index );
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

	for ( const block of getListItemBlocks( listBlock, { direction: 'forward' } ) ) {
		writer.setAttribute( 'listItemId', id, block );
	}
}

/**
 * Splits the list item just before the provided list block.
 *
 * @protected
 * @param {module:engine/model/element~Element} listBlock The list block element.
 * @param {module:engine/model/writer~Writer} writer The model writer.
 */
export function mergeListItemBlocksIntoParentListItem( listBlock, writer ) {
	const blocks = getAllListItemBlocks( listBlock );
	const firstBlock = blocks[ 0 ];
	const parentListItem = firstBlock.previousSibling;

	// TODO remove paranoid check that should not be necessary.
	if ( !parentListItem || !parentListItem.hasAttribute( 'listItemId' ) ) {
		throw 'Cannot merge when there is nothing to merge into.';
	}

	const parentListAttributes = {};

	for ( const attributeKey of parentListItem.getAttributeKeys() ) {
		if ( attributeKey.startsWith( 'list' ) ) {
			parentListAttributes[ attributeKey ] = parentListItem.getAttribute( attributeKey );
		}
	}

	for ( const block of blocks ) {
		writer.setAttributes( parentListAttributes, block );
	}
}

/**
 * Merges the list item with the parent list item.
 *
 * @protected
 * @param {module:engine/model/element~Element} listBlock The list block element.
 * @param {module:engine/model/element~Element} parentBlock The list block element to merge with.
 * @param {module:engine/model/writer~Writer} writer The model writer.
 * @returns {Iterable.<module:engine/model/element~Element>} The iterable of updated blocks.
 */
export function mergeListItemBefore( listBlock, parentBlock, writer ) {
	const attributes = {};

	for ( const [ key, value ] of parentBlock.getAttributes() ) {
		if ( key.startsWith( 'list' ) ) {
			attributes[ key ] = value;
		}
	}

	const blocks = new Set( getListItemBlocks( listBlock, { direction: 'forward' } ) );

	for ( const block of blocks ) {
		writer.setAttributes( attributes, block );
	}

	return blocks;
}

/**
 * Updates indentation of given list blocks.
 *
 * @protected
 * @param {Iterable.<module:engine/model/element~Element>} blocks The iterable of selected blocks.
 * @param {Number} indentBy The indentation level difference.
 * @param {Boolean} expand TODO
 * @param {module:engine/model/writer~Writer} writer The model writer.
 */
export function indentBlocks( blocks, indentBy, { expand, alwaysMerge }, writer ) {
	// Expand the selected blocks to contain the whole list items.
	const allBlocks = expand ? expandListBlocksToCompleteItems( blocks ) : blocks;
	const visited = new Set();

	const referenceIndex = allBlocks.reduce( ( indent, block ) => {
		const blockIndent = block.getAttribute( 'listIndent' );

		return blockIndent < indent ? blockIndent : indent;
	}, Number.POSITIVE_INFINITY );

	const parentBlocks = new Map();

	// Collect parent blocks before the list structure gets altered.
	if ( indentBy < 0 ) {
		for ( const block of allBlocks ) {
			parentBlocks.set( block, ListWalker.first( block, { smallerIndent: true } ) );
		}
	}

	for ( const block of allBlocks ) {
		if ( visited.has( block ) ) {
			continue;
		}

		visited.add( block );

		const blockIndent = block.getAttribute( 'listIndent' ) + indentBy;

		if ( blockIndent < 0 ) {
			for ( const attributeKey of block.getAttributeKeys() ) {
				if ( attributeKey.startsWith( 'list' ) ) {
					writer.removeAttribute( attributeKey, block );
				}
			}

			continue;
		}

		// Merge with parent list item while outdenting.
		if ( indentBy < 0 ) {
			const atReferenceIndent = block.getAttribute( 'listIndent' ) == referenceIndex;

			// Merge if the block indent matches reference indent or the block was passed directly with alwaysMerge flag.
			if ( atReferenceIndent || alwaysMerge && blocks.includes( block ) ) {
				const parentBlock = parentBlocks.get( block );

				// The parent block could become a non-list block.
				if ( parentBlock.hasAttribute( 'listIndent' ) ) {
					const parentItemBlocks = getListItemBlocks( parentBlock, { direction: 'forward' } );

					// Merge with parent only if it wasn't the last item.
					// Merge:
					// * a
					//   * b <- outdent
					//   c
					// Don't merge:
					// * a
					//   * b <- outdent
					// * c
					if ( alwaysMerge || parentItemBlocks.pop().index > block.index ) {
						for ( const mergedBlock of mergeListItemBefore( block, parentBlock, writer ) ) {
							visited.add( mergedBlock );
						}

						continue;
					}
				}
			}
		}

		writer.setAttribute( 'listIndent', blockIndent, block );
	}

	return allBlocks;
}

/**
 * Checks whether the given blocks are related to a single list item.
 * TODO
 */
export function isOnlyOneListItemSelected( blocks ) {
	if ( !blocks.length ) {
		return false;
	}

	const firstItemId = blocks[ 0 ].getAttribute( 'listItemId' );

	if ( !firstItemId ) {
		return false;
	}

	return !blocks.some( item => item.getAttribute( 'listItemId' ) != firstItemId );
}

/**
 * TODO
 */
export function getSameIndentBlocks( blocks ) {
	if ( !blocks.length ) {
		return [];
	}

	const firstIndent = blocks[ 0 ].getAttribute( 'listIndent' );

	return blocks.filter( block => block.getAttribute( 'listIndent' ) == firstIndent );
}
