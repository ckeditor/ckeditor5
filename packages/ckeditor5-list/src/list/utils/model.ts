/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/list/utils/model
 */

import type {
	DocumentFragment,
	Element,
	Model,
	Node,
	Writer,
	Item,
	Schema
} from 'ckeditor5/src/engine.js';

import { uid, toArray, type ArrayOrItem } from 'ckeditor5/src/utils.js';

import ListWalker, { type ListWalkerOptions, SiblingListBlocksIterator } from './listwalker.js';
import { type ListType } from '../listediting.js';

/**
 * The list item ID generator.
 *
 * @internal
 */
export class ListItemUid {
	/**
	 * Returns the next ID.
	 *
	 * @internal
	 */
	/* istanbul ignore next: static function definition -- @preserve */
	public static next(): string {
		return uid();
	}
}

/**
 * An {@link module:engine/model/element~Element} that is known to be a list element.
 *
 * @internal
 */
export interface ListElement extends Element {
	getAttribute( key: 'listItemId' ): string;
	getAttribute( key: 'listIndent' ): number;
	getAttribute( key: 'listType' ): ListType;
	getAttribute( key: string ): unknown;
}

/**
 * Returns true if the given model node is a list item block.
 *
 * @internal
 */
export function isListItemBlock( node: Item | DocumentFragment | null ): node is ListElement {
	return !!node && node.is( 'element' ) && node.hasAttribute( 'listItemId' );
}

/**
 * Returns an array with all elements that represents the same list item.
 *
 * It means that values for `listIndent`, and `listItemId` for all items are equal.
 *
 * @internal
 * @param listItem Starting list item element.
 * @param options.higherIndent Whether blocks with a higher indent level than the start block should be included
 * in the result.
 */
export function getAllListItemBlocks(
	listItem: Node,
	options: {
		higherIndent?: boolean;
	} = {}
): Array<ListElement> {
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
 * @internal
 * @param listItem Starting list item element.
 * @param options.direction Walking direction.
 * @param options.higherIndent Whether blocks with a higher indent level than the start block should be included in the result.
 */
export function getListItemBlocks(
	listItem: Node,
	options: {
		direction?: 'forward' | 'backward';
		higherIndent?: boolean;
	} = {}
): Array<ListElement> {
	const isForward = options.direction == 'forward';

	const items = Array.from( new ListWalker( listItem, {
		...options,
		includeSelf: isForward,
		sameIndent: true,
		sameAttributes: 'listItemId'
	} ) );

	return isForward ? items : items.reverse();
}

/**
 * Returns a list items nested inside the given list item.
 *
 * @internal
 */
export function getNestedListBlocks( listItem: Element ): Array<ListElement> {
	return Array.from( new ListWalker( listItem, {
		direction: 'forward',
		higherIndent: true
	} ) );
}

/**
 * Returns array of all blocks/items of the same list as given block (same indent, same type and properties).
 *
 * @internal
 * @param listItem Starting list item element.
 * @param options Additional list walker options to modify the range of returned list items.
 */
export function getListItems( listItem: Element, options?: ListWalkerOptions ): Array<ListElement> {
	const backwardBlocks = new ListWalker( listItem, {
		sameIndent: true,
		sameAttributes: 'listType',
		...options
	} );

	const forwardBlocks = new ListWalker( listItem, {
		sameIndent: true,
		sameAttributes: 'listType',
		includeSelf: true,
		direction: 'forward',
		...options
	} );

	return [
		...Array.from( backwardBlocks ).reverse(),
		...forwardBlocks
	];
}

/**
 * Check if the given block is the first in the list item.
 *
 * @internal
 * @param listBlock The list block element.
 */
export function isFirstBlockOfListItem( listBlock: Node ): boolean {
	const previousSibling = ListWalker.first( listBlock, {
		sameIndent: true,
		sameAttributes: 'listItemId'
	} );

	if ( !previousSibling ) {
		return true;
	}

	return false;
}

/**
 * Check if the given block is the last in the list item.
 *
 * @internal
 */
export function isLastBlockOfListItem( listBlock: Element ): boolean {
	const nextSibling = ListWalker.first( listBlock, {
		direction: 'forward',
		sameIndent: true,
		sameAttributes: 'listItemId'
	} );

	if ( !nextSibling ) {
		return true;
	}

	return false;
}

/**
 * Expands the given list of selected blocks to include the leading and tailing blocks of partially selected list items.
 *
 * @internal
 * @param blocks The list of selected blocks.
 * @param options.withNested Whether should include nested list items.
 */
export function expandListBlocksToCompleteItems(
	blocks: ArrayOrItem<Element>,
	options: { withNested?: boolean } = {}
): Array<ListElement> {
	blocks = toArray( blocks );

	const higherIndent = options.withNested !== false;
	const allBlocks = new Set<ListElement>();

	for ( const block of blocks ) {
		for ( const itemBlock of getAllListItemBlocks( block, { higherIndent } ) ) {
			allBlocks.add( itemBlock );
		}
	}

	return sortBlocks( allBlocks );
}

/**
 * Expands the given list of selected blocks to include all the items of the lists they're in.
 *
 * @internal
 * @param blocks The list of selected blocks.
 */
export function expandListBlocksToCompleteList( blocks: ArrayOrItem<Element> ): Array<ListElement> {
	blocks = toArray( blocks );

	const allBlocks = new Set<ListElement>();

	for ( const block of blocks ) {
		for ( const itemBlock of getListItems( block ) ) {
			allBlocks.add( itemBlock );
		}
	}

	return sortBlocks( allBlocks );
}

/**
 * Splits the list item just before the provided list block.
 *
 * @internal
 * @param listBlock The list block element.
 * @param writer The model writer.
 * @returns The array of updated blocks.
 */
export function splitListItemBefore(
	listBlock: Element,
	writer: Writer
): Array<ListElement> {
	const blocks = getListItemBlocks( listBlock, { direction: 'forward' } );
	const id = ListItemUid.next();

	for ( const block of blocks ) {
		writer.setAttribute( 'listItemId', id, block );
	}

	return blocks;
}

/**
 * Merges the list item with the parent list item.
 *
 * @internal
 * @param listBlock The list block element.
 * @param parentBlock The list block element to merge with.
 * @param writer The model writer.
 * @returns The array of updated blocks.
 */
export function mergeListItemBefore(
	listBlock: Node,
	parentBlock: Element,
	writer: Writer
): Array<ListElement> {
	const attributes: Record<string, unknown> = {};

	for ( const [ key, value ] of parentBlock.getAttributes() ) {
		if ( key.startsWith( 'list' ) ) {
			attributes[ key ] = value;
		}
	}

	const blocks = getListItemBlocks( listBlock, { direction: 'forward' } );

	for ( const block of blocks ) {
		writer.setAttributes( attributes, block );
	}

	return blocks;
}

/**
 * Increases indentation of given list blocks.
 *
 * @internal
 * @param blocks The block or iterable of blocks.
 * @param writer The model writer.
 * @param options Additional options.
 * @param options.expand Whether should expand the list of blocks to include complete list items.
 * @param options.indentBy The number of levels the indentation should change (could be negative).
 */
export function indentBlocks(
	blocks: ArrayOrItem<ListElement>,
	writer: Writer,
	{ expand, indentBy = 1 }: { expand?: boolean; indentBy?: number } = {}
): Array<ListElement> {
	blocks = toArray( blocks );

	// Expand the selected blocks to contain the whole list items.
	const allBlocks = expand ? expandListBlocksToCompleteItems( blocks ) : blocks;

	for ( const block of allBlocks ) {
		const blockIndent = block.getAttribute( 'listIndent' ) + indentBy;

		if ( blockIndent < 0 ) {
			removeListAttributes( block, writer );
		} else {
			writer.setAttribute( 'listIndent', blockIndent, block );
		}
	}

	return allBlocks;
}

/**
 * Decreases indentation of given list of blocks. If the indentation of some blocks matches the indentation
 * of surrounding blocks, they get merged together.
 *
 * @internal
 * @param blocks The block or iterable of blocks.
 * @param writer The model writer.
 */
export function outdentBlocksWithMerge(
	blocks: ArrayOrItem<ListElement>,
	writer: Writer
): Array<ListElement> {
	blocks = toArray( blocks );

	// Expand the selected blocks to contain the whole list items.
	const allBlocks = expandListBlocksToCompleteItems( blocks );
	const visited = new Set<ListElement>();

	const referenceIndent = Math.min( ...allBlocks.map( block => block.getAttribute( 'listIndent' ) ) );
	const parentBlocks = new Map();

	// Collect parent blocks before the list structure gets altered.
	for ( const block of allBlocks ) {
		parentBlocks.set( block, ListWalker.first( block, { lowerIndent: true } ) );
	}

	for ( const block of allBlocks ) {
		if ( visited.has( block ) ) {
			continue;
		}

		visited.add( block );

		const blockIndent = block.getAttribute( 'listIndent' ) - 1;

		if ( blockIndent < 0 ) {
			removeListAttributes( block, writer );

			continue;
		}

		// Merge with parent list item while outdenting and indent matches reference indent.
		if ( block.getAttribute( 'listIndent' ) == referenceIndent ) {
			const mergedBlocks = mergeListItemIfNotLast( block, parentBlocks.get( block ), writer );

			// All list item blocks are updated while merging so add those to visited set.
			for ( const mergedBlock of mergedBlocks ) {
				visited.add( mergedBlock );
			}

			// The indent level was updated while merging so continue to next block.
			if ( mergedBlocks.length ) {
				continue;
			}
		}

		writer.setAttribute( 'listIndent', blockIndent, block );
	}

	return sortBlocks( visited );
}

/**
 * Removes all list attributes from the given blocks.
 *
 * @internal
 * @param blocks The block or iterable of blocks.
 * @param writer The model writer.
 * @returns Array of altered blocks.
 */
export function removeListAttributes(
	blocks: ArrayOrItem<Element>,
	writer: Writer
): Array<Element> {
	blocks = toArray( blocks );

	// Convert simple list items to plain paragraphs.
	for ( const block of blocks ) {
		if ( block.is( 'element', 'listItem' ) ) {
			writer.rename( block, 'paragraph' );
		}
	}

	// Remove list attributes.
	for ( const block of blocks ) {
		for ( const attributeKey of block.getAttributeKeys() ) {
			if ( attributeKey.startsWith( 'list' ) ) {
				writer.removeAttribute( attributeKey, block );
			}
		}
	}

	return blocks;
}

/**
 * Checks whether the given blocks are related to a single list item.
 *
 * @internal
 * @param blocks The list block elements.
 */
export function isSingleListItem( blocks: Array<Node> ): boolean {
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
 * Modifies the indents of list blocks following the given list block so the indentation is valid after
 * the given block is no longer a list item.
 *
 * @internal
 * @param lastBlock The last list block that has become a non-list element.
 * @param writer The model writer.
 * @returns Array of altered blocks.
 */
export function outdentFollowingItems( lastBlock: Element, writer: Writer ): Array<ListElement> {
	const changedBlocks = [];

	// Start from the model item that is just after the last turned-off item.
	let currentIndent = Number.POSITIVE_INFINITY;

	// Correct indent of all items after the last turned off item.
	// Rules that should be followed:
	// 1. All direct sub-items of turned-off item should become indent 0, because the first item after it
	//    will be the first item of a new list. Other items are at the same level, so should have same 0 index.
	// 2. All items with indent lower than indent of turned-off item should become indent 0, because they
	//    should not end up as a child of any of list items that they were not children of before.
	// 3. All other items should have their indent changed relatively to it's parent.
	//
	// For example:
	// 1  * --------
	// 2     * --------
	// 3        * --------			<-- this is turned off.
	// 4           * --------		<-- this has to become indent = 0, because it will be first item on a new list.
	// 5              * --------	<-- this should be still be a child of item above, so indent = 1.
	// 6        * --------			<-- this has to become indent = 0, because it should not be a child of any of items above.
	// 7           * --------		<-- this should be still be a child of item above, so indent = 1.
	// 8     * --------				<-- this has to become indent = 0.
	// 9        * --------			<-- this should still be a child of item above, so indent = 1.
	// 10          * --------		<-- this should still be a child of item above, so indent = 2.
	// 11          * --------		<-- this should still be at the same level as item above, so indent = 2.
	// 12 * --------				<-- this and all below are left unchanged.
	// 13    * --------
	// 14       * --------
	//
	// After turning off 3 the list becomes:
	//
	// 1  * --------
	// 2     * --------
	//
	// 3  --------
	//
	// 4  * --------
	// 5     * --------
	// 6  * --------
	// 7     * --------
	// 8  * --------
	// 9     * --------
	// 10       * --------
	// 11       * --------
	// 12 * --------
	// 13    * --------
	// 14       * --------
	//
	// Thanks to this algorithm no lists are mismatched and no items get unexpected children/parent, while
	// those parent-child connection which are possible to maintain are still maintained. It's worth noting
	// that this is the same effect that we would be get by multiple use of outdent command. However doing
	// it like this is much more efficient because it's less operation (less memory usage, easier OT) and
	// less conversion (faster).
	for ( const { node } of new SiblingListBlocksIterator( lastBlock.nextSibling ) ) {
		// Check each next list item, as long as its indent is higher than 0.
		const indent = node.getAttribute( 'listIndent' );

		// If the indent is 0 we are not going to change anything anyway.
		if ( indent == 0 ) {
			break;
		}

		// We check if that's item indent is lower than current relative indent.
		if ( indent < currentIndent ) {
			// If it is, current relative indent becomes that indent.
			currentIndent = indent;
		}

		// Fix indent relatively to current relative indent.
		// Note, that if we just changed the current relative indent, the newIndent will be equal to 0.
		const newIndent = indent - currentIndent;

		writer.setAttribute( 'listIndent', newIndent, node );
		changedBlocks.push( node );
	}

	return changedBlocks;
}

/**
 * Returns the array of given blocks sorted by model indexes (document order).
 *
 * @internal
 */
export function sortBlocks<T extends Element>( blocks: Iterable<T> ): Array<T> {
	return Array.from( blocks )
		.filter( block => block.root.rootName !== '$graveyard' )
		.sort( ( a, b ) => a.index! - b.index! );
}

/**
 * Returns a selected block object. If a selected object is inline or when there is no selected
 * object, `null` is returned.
 *
 * @internal
 * @param model The instance of editor model.
 * @returns Selected block object or `null`.
 */
export function getSelectedBlockObject( model: Model ): Element | null {
	const selectedElement = model.document.selection.getSelectedElement();

	if ( !selectedElement ) {
		return null;
	}

	if ( model.schema.isObject( selectedElement ) && model.schema.isBlock( selectedElement ) ) {
		return selectedElement;
	}

	return null;
}

/**
 * Checks whether the given block can be replaced by a listItem.
 *
 * Note that this is possible only when multiBlock = false option is set in feature config.
 *
 * @param block A block to be tested.
 * @param schema The schema of the document.
 */
export function canBecomeSimpleListItem( block: Element, schema: Schema ): boolean {
	return schema.checkChild( block.parent as Element, 'listItem' ) && schema.checkChild( block, '$text' ) && !schema.isObject( block );
}

/**
 * Returns true if listType is of type `numbered` or `customNumbered`.
 */
export function isNumberedListType( listType: ListType ): boolean {
	return listType == 'numbered' || listType == 'customNumbered';
}

/**
 * Merges a given block to the given parent block if parent is a list item and there is no more blocks in the same item.
 */
function mergeListItemIfNotLast(
	block: ListElement,
	parentBlock: ListElement,
	writer: Writer
) {
	const parentItemBlocks = getListItemBlocks( parentBlock, { direction: 'forward' } );

	// Merge with parent only if outdented item wasn't the last one in its parent.
	// Merge:
	// * a			->		* a
	//   * [b]		->		  b
	//   c			->		  c
	// Don't merge:
	// * a			->		* a
	//   * [b]		-> 		* b
	// * c			->		* c
	if ( parentItemBlocks.pop()!.index! > block.index! ) {
		return mergeListItemBefore( block, parentBlock, writer );
	}

	return [];
}
