/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/createtreefromdropdownmenuview
 */

import DropdownMenuListItemView from '../dropdownmenulistitemview.js';
import { createTextSearchMetadata } from './dropdownmenutreesearchmetadata.js';
import {
	isDropdownMenuFocusableFlatItemView,
	isDropdownMenuView
} from '../guards.js';

import type ViewCollection from '../../../viewcollection.js';
import type { DropdownNestedMenuListItemView } from '../typings.js';
import type {
	DropdownMenuViewsRootTree,
	DropdownMenuViewsTreeChildItem
} from './tree/dropdownsearchtreetypings.js';

/**
 * Creates a tree structure from a DropdownMenuView.
 *
 * ```ts
 * const tree = createTreeFromDropdownMenuView( menuView );
 *
 * expect( tree ).to.deep.equal(
 * 	{
 * 		kind: 'Root',
 * 		children: [
 * 			{
 * 				kind: 'Menu 1',
 * 				search: {
 * 					raw: 'Menu 1',
 * 					text: 'menu 1'
 * 				},
 * 				menu: new DropdownMenuView( ... ),
 * 				children: [
 * 					{
 * 						kind: 'Item',
 * 						search: {
 * 							raw: 'Buttom',
 * 							text: 'button'
 * 						},
 * 						item: new DropdownMenuListItemButtonView( ... )
 * 					}
 * 				]
 * 			}
 * 		]
 * 	}
 * );
 * ```
 *
 * @param menu The DropdownMenuView to create the tree from.
 * @returns The root tree structure representing the DropdownMenuView.
 */
export function createTreeFromDropdownMenuView( menu: DropdownMenuViewLike ): DropdownMenuViewsRootTree {
	return {
		kind: 'Root',
		children: Array.from( menu.menuItems ).flatMap( ( item ): Array<DropdownMenuViewsTreeChildItem> => {
			if ( !( item instanceof DropdownMenuListItemView ) ) {
				return [];
			}

			const { flatItemOrNestedMenuView } = item;

			if ( isDropdownMenuView( flatItemOrNestedMenuView ) ) {
				return [
					{
						kind: 'Menu',
						search: createTextSearchMetadata( flatItemOrNestedMenuView.buttonView.label ),
						children: createTreeFromDropdownMenuView( flatItemOrNestedMenuView ).children,
						menu: flatItemOrNestedMenuView
					}
				];
			}

			if ( isDropdownMenuFocusableFlatItemView( flatItemOrNestedMenuView ) ) {
				return [
					{
						kind: 'Item',
						search: createTextSearchMetadata( flatItemOrNestedMenuView.label ),
						item: flatItemOrNestedMenuView
					}
				];
			}

			return [];
		} )
	};
}

/**
 * Represents a view-like object for a dropdown menu.
 */
type DropdownMenuViewLike = {
	menuItems: Array<DropdownNestedMenuListItemView> | ViewCollection<DropdownNestedMenuListItemView>;
};
