/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/tree/dropdownmenutreeflattenutils
 */

import type { DropdownMenusViewsTreeNode } from './dropdownmenutreetypings.js';

import { walkOverDropdownMenuTreeItems } from './dropdownmenutreewalker.js';

/**
 * Flattens a dropdown menu tree into an array of flattened nodes.
 *
 * ```ts
 * const tree = {
 * 	type: 'Root',
 * 	children: [
 * 		{
 * 			type: 'Menu',
 * 			search: {
 * 				raw: 'Menu 1',
 * 				text: 'menu 1'
 * 			},
 * 			menu: new DropdownMenuView( ... ),
 * 			children: [
 * 				{
 * 					type: 'Item',
 * 					search: {
 * 						raw: 'Buttom',
 * 						text: 'button'
 * 					},
 * 					item: new DropdownMenuListItemButtonView( ... )
 * 				}
 * 			]
 * 		}
 * 	]
 * };
 *
 * const flattenEntries = flattenDropdownMenuTree( tree );
 *
 * expect( flattenEntries ).to.deep.equal( [
 * 	{
 * 		parents: [ tree ]
 * 		node: tree,
 * 	},
 * 	{
 * 		parents: [ tree ],
 * 		node: tree.children[ 0 ]
 * 	},
 * 	{
 * 		parents: [ tree, tree.children[ 0 ] ],
 * 		node: tree.children[ 0 ].children[ 0 ]
 * 	}
 * ] );
 * ```
 *
 * @template Extend The type of additional properties that can be attached to each node.
 * @param tree The dropdown menu tree to flatten.
 * @returns An array of flattened nodes.
 */
export function flattenDropdownMenuTree<Extend>(
	tree: DropdownMenusViewsTreeNode<Extend>
): Array<DropdownMenusViewsTreeFlattenNode<Extend>> {
	const flattenNodes: Array<DropdownMenusViewsTreeFlattenNode<Extend>> = [];

	walkOverDropdownMenuTreeItems(
		{
			Default: ( { node, parents } ) => {
				flattenNodes.push(
					{
						parents,
						node
					}
				);
			}
		},
		tree
	);

	return flattenNodes;
}

/**
 * Represents a node in the flattened tree structure of dropdown menus views.
 */
type DropdownMenusViewsTreeFlattenNode<Extend = unknown> = {
	parents: Array<DropdownMenusViewsTreeNode<Extend>>;
	node: DropdownMenusViewsTreeNode<Extend>;
};

/**
 * Calculates the total number of searchable button like items in a dropdown menu tree.
 *
 * ```ts
 * const totalItemsCount = getTotalDropdownMenuTreeFlatItemsCount( {
 * 	type: 'Root',
 * 	children: [
 * 		{
 * 			type: 'Menu',
 * 			search: {
 * 				raw: 'Menu 1',
 * 				text: 'menu 1'
 * 			},
 * 			menu: new DropdownMenuView( ... ),
 * 			children: [
 * 				{
 * 					type: 'Item',
 * 					search: {
 * 						raw: 'Buttom',
 * 						text: 'button'
 * 					},
 * 					item: new DropdownMenuListItemButtonView( ... )
 * 				},
 * 				{
 * 					type: 'Item',
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
