/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/gettotaldropdownmenutreeflatitemscount
 */

import type { DropdownMenusViewsTreeNode } from './tree/dropdownsearchtreetypings.js';
import { walkOverDropdownMenuTreeItems } from './walkoverdropdownmenutreeitems.js';

/**
 * Calculates the total number of searchable button like items in a dropdown menu tree.
 *
 * ```ts
 * const totalItemsCount = getTotalDropdownMenuTreeFlatItemsCount( {
 * 	kind: 'Root',
 * 	children: [
 * 		{
 * 			kind: 'Menu 1',
 * 			search: {
 * 				raw: 'Menu 1',
 * 				text: 'menu 1'
 * 			},
 * 			menu: new DropdownMenuView( ... ),
 * 			children: [
 * 				{
 * 					kind: 'Item',
 * 					search: {
 * 						raw: 'Buttom',
 * 						text: 'button'
 * 					},
 * 					item: new DropdownMenuListItemButtonView( ... )
 * 				},
 * 				{
 * 					kind: 'Item',
 * 					search: {
 * 						raw: 'Buttom 2',
 * 						text: 'button 2'
 * 					},
 * 					item: new DropdownMenuListItemButtonView( ... )
 * 				}
 * 			]
 * 		}
 * 	]
 * } );
 *
 * // Counts "Button 1" and "Button 2" excluding "Menu 1"
 * expect( totalItemsCount ).to.equal( 2 )
 * ```
 *
 * @template Extend The type of data associated with each tree node.
 * @param tree The root node of the dropdown menu tree.
 * @returns The total number of searchable items in the tree.
 */
export function getTotalDropdownMenuTreeFlatItemsCount<Extend>( tree: DropdownMenusViewsTreeNode<Extend> ): number {
	let totalItemsCount = 0;

	walkOverDropdownMenuTreeItems<Extend>(
		{
			Item: () => {
				totalItemsCount++;
			}
		},
		tree
	);

	return totalItemsCount;
}
