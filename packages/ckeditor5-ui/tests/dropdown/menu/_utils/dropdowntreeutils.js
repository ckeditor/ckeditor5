/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { walkOverDropdownMenuTreeItems } from '../../../../src/dropdown/menu/tree/dropdownmenutreewalker.js';

/**
 * Creates a root tree with the specified children.
 *
 * @param children The children of the root tree.
 * @returns The root tree object.
 */
export function createRootTree( children = [] ) {
	return {
		type: 'Root',
		children
	};
}

/**
 * Maps the menu view to a menu tree item based on the label.
 *
 * @param label The label to search for.
 * @param tree The menu tree object.
 * @param children The children array.
 * @returns The mapped menu tree item.
 */
export function mapMenuViewToMenuTreeItemByLabel( label, tree, children = [] ) {
	return mapMenuViewToMenuTreeItem(
		findMenuTreeMenuViewByLabel( label, tree ),
		children
	);
}

/**
 * Maps the menu view to a menu tree item.
 *
 * @param menu The menu view object.
 * @param children The children of the menu tree item.
 * @returns The mapped menu tree item.
 */
export function mapMenuViewToMenuTreeItem( menu, children = [] ) {
	return {
		type: 'Menu',
		menu,
		search: {
			raw: menu.buttonView.label || '',
			text: ( menu.buttonView.label || '' ).toLowerCase()
		},
		children
	};
}

/**
 * Maps a button view to a flat menu tree item based on the label.
 *
 * @param label The label of the menu tree item.
 * @param tree The menu tree object.
 * @returns The flat menu tree item.
 */
export function mapButtonViewToFlatMenuTreeItemByLabel( label, tree ) {
	return mapButtonViewToFlatMenuTreeItem(
		findMenuTreeViewFlatItemByLabel( label, tree )
	);
}

/**
 * Maps a button view to a flat menu tree item.
 *
 * @param button The button view to be mapped.
 * @returns The mapped menu tree item.
 */
export function mapButtonViewToFlatMenuTreeItem( button ) {
	return {
		type: 'Item',
		item: button,
		search: {
			raw: button.label,
			text: button.label.toLowerCase()
		}
	};
}

/**
 * Finds the menu tree menu view by label.
 *
 * @param label The label to search for.
 * @param tree The tree object to search in.
 * @returns The menu tree menu view.
 */
export function findMenuTreeMenuViewByLabel( label, tree ) {
	return findMenuTreeItemByLabel( label, tree ).menu;
}

/**
 * Finds a menu tree view flat item by its label.
 *
 * @param label The label of the item to find.
 * @param tree The menu tree to search in.
 * @returns The found menu tree view flat item.
 */
export function findMenuTreeViewFlatItemByLabel( label, tree ) {
	return findMenuTreeItemByLabel( label, tree ).item;
}

/**
 * Finds a menu tree item by its label.
 *
 * @param label The label of the menu tree item to find.
 * @param tree The tree object to search in.
 * @returns The found menu tree item or null if not found.
 */
export function findMenuTreeItemByLabel( label, tree ) {
	return findAllMenusTreeItemsByLabel( label, tree )[ 0 ] || null;
}

/**
 * Finds all menu tree items with a specific label.
 *
 * @param label The label to search for.
 * @param tree The tree object to search in.
 * @returns An array of found menu tree items.
 */
export function findAllMenusTreeItemsByLabel( label, tree ) {
	const foundMenus = [];

	const lookup = node => {
		if ( node.search && node.search.raw === label ) {
			foundMenus.push( node );
		}
	};

	walkOverDropdownMenuTreeItems( lookup, tree );

	return foundMenus;
}

/**
 * Marks an item as found by adding a 'found' property to it.
 *
 * @param item The item to mark as found.
 * @returns The updated item with the 'found' property set to true.
 */
export function markAsFound( item ) {
	return {
		...item,
		found: true
	};
}
