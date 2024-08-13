/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/tree/dropdownmenutreetypings
 */

import type DropdownMenuView from '../dropdownmenuview.js';
import type DropdownMenuListItemButtonView from '../dropdownmenulistitembuttonview.js';

/**
 * Represents the metadata for tree search in a dropdown menu.
 */
export type TreeSearchMetadata = {

	/**
	 * The raw search string.
	 * This field can contain the original text of a button, for example.
	 */
	raw: string;

	/**
	 * The processed search string.
	 */
	text: string;
};

/**
 * Represents an object that contains tree search metadata.
 */
type WithTreeSearchMetadata = {
	search: TreeSearchMetadata;
};

/**
 * Represents a tree entry with a specific type in a dropdown menu tree.
 */
type WithTreeEntryType<K extends string> = {
	type: K;
};

/**
 * Represents a flat item in a dropdown menu tree.
 */
export type DropdownMenuViewsTreeFlatItem<Extend = unknown> =
	& Extend
	& WithTreeEntryType<'Item'>
	& WithTreeSearchMetadata
	& {
		item: DropdownMenuView | DropdownMenuListItemButtonView;
	};

/**
 * Represents a nested menu entry in a dropdown menu tree.
 */
export type DropdownMenuViewsNestedTree<Extend = unknown> =
	& Extend
	& WithTreeEntryType<'Menu'>
	& WithTreeSearchMetadata
	& {
		menu: DropdownMenuView;
		children: Array<DropdownMenuViewsTreeChildItem<Extend>>;
	};

/**
 * Represents a child item in a dropdown menu tree.
 */
export type DropdownMenuViewsTreeChildItem<Extend = unknown> =
	| DropdownMenuViewsTreeFlatItem<Extend>
	| DropdownMenuViewsNestedTree<Extend>;

/**
 * Represents the root entry of a dropdown menu tree.
 */
export type DropdownMenuViewsRootTree<Extend = unknown> =
	& WithTreeEntryType<'Root'>
	& {
		children: Array<DropdownMenuViewsTreeChildItem<Extend>>;
	};

/**
 * Represents all possible types of nodes in a dropdown menu tree.
 */
export type DropdownMenusViewsTreeNode<Extend = unknown> =
	| DropdownMenuViewsTreeChildItem<Extend>
	| DropdownMenuViewsRootTree<Extend>;

/**
 * Represents the type of a dropdown menu tree node.
 */
export type DropdownMenusViewsTreeNodeType = DropdownMenusViewsTreeNode['type'];

/**
 * Extracts a specific type of dropdown menu tree node by its type from the dropdown menu tree.
 */
export type ExtractDropdownMenuViewTreeNodeByType<
	T extends DropdownMenusViewsTreeNodeType,
	Extend = unknown
> =
	Extract<DropdownMenusViewsTreeNode<Extend>, { type: T }>;

/**
 * Excludes a specific type of dropdown menu tree node by its type.
 */
export type ExcludeDropdownMenuViewTreeNodeByType<
	T extends DropdownMenusViewsTreeNodeType,
	Extend = unknown
> =
	Exclude<DropdownMenusViewsTreeNode<Extend>, { type: T }>;
