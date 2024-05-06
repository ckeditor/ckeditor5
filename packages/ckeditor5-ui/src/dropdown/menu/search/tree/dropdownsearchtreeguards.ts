/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/tree/dropdownsearchtreeguards
 */

import type {
	DropdownMenuViewsNestedTree,
	DropdownMenuViewsTreeFlatItem,
	DropdownMenusViewsTreeNode
} from './dropdownsearchtreetypings.js';

/**
 * Checks if the given node is a DropdownMenuViewsNestedTree.
 *
 * @param node The node to check.
 * @returns `true` if the node is a DropdownMenuViewsNestedTree, `false` otherwise.
 */
export const isDropdownTreeMenuItem = <Extend>(
	node: DropdownMenusViewsTreeNode<Extend>
): node is DropdownMenuViewsNestedTree<Extend> =>
		node.kind === 'Menu';

/**
 * Checks if the given node is a DropdownMenuViewsNestedTree item.
 *
 * @param node The node to check.
 * @returns `true` if the node is a DropdownMenuViewsNestedTree item, `false` otherwise.
 */
export const isDropdownTreeFlatItem = <Extend>(
	node: DropdownMenusViewsTreeNode<Extend>
): node is DropdownMenuViewsTreeFlatItem<Extend> =>
		node.kind === 'Item';
