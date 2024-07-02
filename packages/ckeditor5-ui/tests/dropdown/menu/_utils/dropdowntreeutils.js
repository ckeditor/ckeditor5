/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DropdownMenuView from '../../../../src/dropdown/menu/dropdownmenuview.js';
import DropdownMenuListItemButtonView from '../../../../src/dropdown/menu/dropdownmenulistitembuttonview.js';

/**
 * Finds the menu tree menu view by label.
 *
 * @param label The label to search for.
 * @param tree The tree object to search in.
 * @returns The menu tree menu view.
 */
export function findMenuTreeMenuViewByLabel( label, tree ) {
	return findMenuTreeItemByLabel( label, tree );
}

/**
 * Finds a menu tree view flat item by its label.
 *
 * @param label The label of the item to find.
 * @param tree The menu tree to search in.
 * @returns The found menu tree view flat item.
 */
export function findMenuTreeViewFlatItemByLabel( label, tree ) {
	return findMenuTreeItemByLabel( label, tree );
}

/**
 * Finds all menu tree items with a specific label.
 *
 * @returns An array of found menu tree items.
 */
export function findMenuTreeItemByLabel( label, items ) {
	for ( const item of items ) {
		const childView = item.childView;

		if ( childView instanceof DropdownMenuView ) {
			if ( childView.buttonView.label === label ) {
				return childView;
			} else {
				const result = findMenuTreeItemByLabel( label, childView.listView.items );

				if ( result ) {
					return result;
				}
			}
		}

		if ( childView instanceof DropdownMenuListItemButtonView ) {
			if ( childView.label === label ) {
				return childView;
			}
		}
	}

	return null;
}
