/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/groupdropdowntreebyfirstfoundparent
 */

import { flattenDropdownMenuTree } from './flattendropdownmenutree.js';
import { isDropdownTreeFlatItem } from './tree/dropdownsearchtreeguards.js';

import type {
	DropdownMenusViewsFilteredFlatItem,
	DropdownMenusViewsFilteredTreeNode
} from './filterdropdownmenutree.js';

/**
 * Groups the found items and returns them as a flat list.
 * If the parent name matches the search phrase, it groups the items under that parent.
 * Otherwise, it takes the first parent from the edge.
 *
 * ```ts
 * const tree = createTreeFromDropdownMenuView( menuView );
 * const filteredTree = filterDropdownMenuTreeByRegExp( /menu 1/i, tree );
 * const groupedTree = groupDropdownTreeByFirstFoundParent( filteredTree );
 *
 * expect( groupedTree ).to.deep.equal( [
 * 	{
 * 		parent: {
 * 			kind: 'Menu 1',
 * 			search: {
 * 				raw: 'Menu 1',
 * 				text: 'menu 1'
 * 			},
 * 			menu: new DropdownMenuView( ... ),
 * 			children: [ ... ]
 * 		},
 * 		children: [
 * 			{
 * 				kind: 'Item',
 * 				search: {
 * 					raw: 'Buttom',
 * 					text: 'button'
 * 				},
 * 				item: new DropdownMenuListItemButtonView( ... )
 * 			}
 * 		]
 * 	},
 * ] );
 * ```
 *
 * @param tree The filtered tree of dropdown menu items.
 * @returns An array of grouped dropdown tree entries.
 */
export function groupDropdownTreeByFirstFoundParent( tree: DropdownMenusViewsFilteredTreeNode ): Array<GroupedDropdownTreeFlatEntry> {
	// Find the grouping parent based on the search results
	const findGroupingParent = ( parents: Array<DropdownMenusViewsFilteredTreeNode> ): DropdownMenusViewsFilteredTreeNode => {
		// Reverse the parents array and find the first parent that is marked as found
		const maybeFirstFoundParent = [ ...parents ].reverse().find(
			item => {
				if ( item.kind === 'Root' ) {
					return false;
				}

				return item.found;
			}
		);

		// If a parent is found, return it
		if ( maybeFirstFoundParent ) {
			return maybeFirstFoundParent;
		}

		// If no parent is found, return the last parent from the edge
		return parents[ parents.length - 1 ];
	};

	// Group the parents and their children based on the grouping parent
	const groupedParents = flattenDropdownMenuTree( tree ).reduce<FoundDropdownTreeParentsItemsMap>(
		( acc, { parents, node } ) => {
			if ( !isDropdownTreeFlatItem( node ) ) {
				return acc;
			}

			const groupingParent = findGroupingParent( parents );

			if ( !acc.has( groupingParent ) ) {
				acc.set( groupingParent, [ node ] );
			} else {
				acc.get( groupingParent )!.push( node );
			}

			return acc;
		},
		new Map()
	);

	// Convert the grouped parents and children into an array of GroupedDropdownTreeFlatEntry objects
	return Array
		.from( groupedParents )
		.map( ( [ parent, children ] ) => ( {
			parent,
			children
		} ) );
}

/**
 * Represents a map that stores the found dropdown tree parents and their corresponding items.
 */
type FoundDropdownTreeParentsItemsMap = Map<DropdownMenusViewsFilteredTreeNode, Array<DropdownMenusViewsFilteredFlatItem>>;

/**
 * Represents an entry in the grouped dropdown tree.
 * It consists of a parent node and an array of its children.
 */
type GroupedDropdownTreeFlatEntry = {
	parent: DropdownMenusViewsFilteredTreeNode;
	children: Array<DropdownMenusViewsFilteredFlatItem>;
};
