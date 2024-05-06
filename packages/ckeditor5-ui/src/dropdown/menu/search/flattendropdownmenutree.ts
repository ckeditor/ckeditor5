/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/flattendropdownmenutree
 */

import type { DropdownMenusViewsTreeNode } from './tree/dropdownsearchtreetypings.js';

import { walkOverDropdownMenuTreeItems } from './walkoverdropdownmenutreeitems.js';

/**
 * Flattens a dropdown menu tree into an array of flattened nodes.
 *
 * ```ts
 * const tree = {
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
