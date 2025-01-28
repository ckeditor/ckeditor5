/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/list/listutils
 */

import type { Element, Node } from 'ckeditor5/src/engine.js';
import type { ArrayOrItem } from 'ckeditor5/src/utils.js';

import { Plugin } from 'ckeditor5/src/core.js';
import {
	type ListElement,
	expandListBlocksToCompleteItems,
	expandListBlocksToCompleteList,
	isFirstBlockOfListItem,
	isListItemBlock,
	isNumberedListType
} from './utils/model.js';
import type { ListType } from './listediting.js';

/**
 * A set of helpers related to document lists.
 */
export default class ListUtils extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListUtils' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * Expands the given list of selected blocks to include all the items of the lists they're in.
	 *
	 * @param blocks The list of selected blocks.
	 */
	public expandListBlocksToCompleteList( blocks: ArrayOrItem<Element> ): Array<Element> {
		return expandListBlocksToCompleteList( blocks );
	}

	/**
	 * Check if the given block is the first in the list item.
	 *
	 * @param listBlock The list block element.
	 */
	public isFirstBlockOfListItem( listBlock: Element ): boolean {
		return isFirstBlockOfListItem( listBlock );
	}

	/**
	 * Returns true if the given model node is a list item block.
	 *
	 * @param node A model node.
	 */
	public isListItemBlock( node: Node | null ): node is ListElement {
		return isListItemBlock( node );
	}

	/**
	 * Expands the given list of selected blocks to include the leading and tailing blocks of partially selected list items.
	 *
	 * @param blocks The list of selected blocks.
	 * @param options.withNested Whether should include nested list items.
	 */
	public expandListBlocksToCompleteItems( blocks: ArrayOrItem<Element>, options: { withNested?: boolean } = {} ): Array<Element> {
		return expandListBlocksToCompleteItems( blocks, options );
	}

	/**
	 * Returns true if listType is of type `numbered` or `customNumbered`.
	 */
	public isNumberedListType( listType: ListType ): boolean {
		return isNumberedListType( listType );
	}
}
