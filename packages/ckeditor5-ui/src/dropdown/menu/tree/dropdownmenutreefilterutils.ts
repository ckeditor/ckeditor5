/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/tree/dropdownmenutreefilterutils
 */

import { cloneDeepWith } from 'lodash-es';

import type {
	DropdownMenuViewsRootTree,
	DropdownMenuViewsTreeChildItem,
	DropdownMenuViewsTreeFlatItem,
	DropdownMenusViewsTreeNode,
	ExcludeDropdownMenuViewTreeNodeByType
} from './dropdownmenutreetypings.js';

import { walkOverDropdownMenuTreeItems } from './dropdownmenutreewalker.js';
import {
	flattenDropdownMenuTree,
	getTotalDropdownMenuTreeFlatItemsCount
} from './dropdownmenutreeflattenutils.js';

import View from '../../../view.js';

/**
 * Filters a dropdown menu tree by a regular expression.
 *
 * ```ts
 * const tree = createTreeFromDropdownMenuView( menuView );
 *
 * // For null regExp, the tree should be returned as is.
 * const { filteredTree } = filterDropdownMenuTreeByRegExp( null, tree );
 * expect( filteredTree ).to.be.deep.equal( tree );
 *
 * // For a regExp matching 'menu 1', only the 'Menu 1' node should be returned.
 * const { filteredTree: filteredTree2 } = filterDropdownMenuTreeByRegExp( /menu 1/i, tree );
 *
 * expect( filteredTree2 ).to.be.deep.equal( {
 * 	type: 'Root',
 * 	children: [
 * 		{
 *
 * 			type: 'Menu',
 * 			search: {
 * 				raw: 'Menu 1',
 * 				text: 'menu 1'
 * 			},
 * 			menu: new DropdownMenuView( ... ),
 * 			children: [ ... ]
 * 		}
 * 	]
 * } );
 * ```
 *
 * @param regExp The regular expression used for filtering. If null, returns the tree with all items.
 * @param tree The dropdown menu tree to filter.
 * @returns The filtered dropdown menu tree.
 */
export const filterDropdownMenuTreeByRegExp = ( regExp: RegExp | null, tree: DropdownMenuViewsRootTree ): DropdownMenuSearchResult =>
	filterDropdownMenuTree(
		( { search } ) => {
			// If no regExp provided treat every item as matching.
			if ( !regExp ) {
				return true;
			}

			return !!search.text.match( regExp );
		},
		tree
	);

/**
 * Filters the dropdown menu tree based on the provided filter function.
 * Returns a copy of the filtered tree and does not modify the original tree.
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
 * 						raw: 'Bread',
 * 						text: 'bread'
 * 					},
 * 					item: new DropdownMenuListItemButtonView( ... )
 * 				},
 * 				{
 * 					type: 'Item',
 * 					search: {
 * 						raw: 'Garlic',
 * 						text: 'garlic'
 * 					},
 * 					item: new DropdownMenuListItemButtonView( ... )
 * 				}
 * 			]
 * 		},
 * 		{
 * 			type: 'Menu 2',
 * 			search: {
 * 				raw: 'Menu 2',
 * 				text: 'menu 2',
 * 			},
 * 			children: [
 * 				// 10 entries
 * 			]
 * 		},
 * 		{
 * 			type: 'Menu 3',
 * 			// ...
 * 		}
 * 	]
 * };
 *
 * const filterResult = filterDropdownMenuTree(
 * 	treeEntry => [ 'garlic', 'menu 2' ].includes( treeEntry.search.text ),
 * 	tree
 * );
 *
 * expect( filterResult ).to.deep.equal( {
 * 	totalItemsCount: 12,
 * 	resultsCount: 11,
 * 	filteredTree: {
 * 		type: 'Root',
 * 		children: [
 * 			{
 * 				type: 'Menu',
 * 				search: {
 * 					raw: 'Menu 1',
 * 					text: 'menu 1'
 * 				},
 * 				menu: new DropdownMenuView( ... ),
 * 				children: [
 * 					{
 * 						type: 'Item',
 * 						found: true,
 * 						search: {
 * 							raw: 'Bread',
 * 							text: 'bread'
 * 						},
 * 						item: new DropdownMenuListItemButtonView( ... )
 * 					}
 * 				]
 * 			},
 * 			{
 * 				type: 'Menu 2',
 * 				found: true,
 * 				search: {
 * 					raw: 'Menu 2',
 * 					text: 'menu 2',
 * 				},
 * 				children: [
 * 					// 10 identical entries without `found` property
 * 				]
 * 			}
 * 		]
 * }
 * } );
 * ```
 *
 * @param filterFn The filter function to apply to each node in the tree.
 * @param tree The dropdown menu tree to filter.
 * @returns The filtered tree and the total number of searchable items in the tree.
 */
export function filterDropdownMenuTree(
	filterFn: ( node: ExcludeDropdownMenuViewTreeNodeByType<'Root'> ) => boolean,
	tree: DropdownMenuViewsRootTree
): DropdownMenuSearchResult {
	const clonedTree: DropdownMenusViewsFilteredTreeNode = shallowCloneDropdownMenuTree( tree );
	const totalItemsCount = getTotalDropdownMenuTreeFlatItemsCount( clonedTree );

	walkOverDropdownMenuTreeItems(
		{
			Menu: {
				enter: ( { node } ) => {
					if ( filterFn( node ) ) {
						node.found = true;
						return false;
					}
				},

				leave: ( { parent, node } ) => {
					// If there is no children left erase current menu from parent entry.
					if ( !node.children.length ) {
						tryRemoveDropdownMenuTreeChild( parent, node );
					}
				}
			},
			Item: ( { parent, node } ) => {
				// Reject element from tree if not matches.
				if ( !filterFn( node ) ) {
					tryRemoveDropdownMenuTreeChild( parent, node );
				} else {
					node.found = true;
				}
			}
		},
		clonedTree
	);

	return {
		resultsCount: getTotalDropdownMenuTreeFlatItemsCount( clonedTree ),
		filteredTree: clonedTree,
		totalItemsCount
	};
}

/**
 * Represents a type used to mark which tree items have been found.
 */
type WithFoundAttribute = {
	found?: boolean;
};

/**
 * Represents a filtered flat item in the dropdown menu views.
 * It is a type that extends `DropdownMenuViewsTreeFlatItem` and adds the `WithFoundAttribute` attribute.
 */
export type DropdownMenusViewsFilteredFlatItem = DropdownMenuViewsTreeFlatItem<WithFoundAttribute>;

/**
 * Represents a filtered tree node in a dropdown menu view.
 */
export type DropdownMenusViewsFilteredTreeNode = DropdownMenusViewsTreeNode<WithFoundAttribute>;

/**
 * Represents the result of a dropdown menu search.
 */
export type DropdownMenuSearchResult = {

	/**
	 * The filtered tree containing the search results.
	 */
	filteredTree: DropdownMenusViewsFilteredTreeNode;

	/**
	 * The number of search results.
	 */
	resultsCount: number;

	/**
	 * The total number of items in the dropdown menu.
	 */
	totalItemsCount: number;
};

/**
 * Creates a shallow clone of the dropdown menu tree, excluding instances of the View class.
 *
 * ```ts
 * const tree = createTreeFromDropdownMenuView( menuView );
 * const clonedTree = shallowCloneDropdownMenuTree( tree );
 *
 * // It clones whole tree structure but not the View instances.
 * expect( tree ).not.to.be.deep.equal( clonedTree );
 *
 * // `View` reference is the same.
 * expect( tree.children[ 0 ].menu ).to.be.instanceOf( View );
 * expect( clonedTree.children[ 0 ].menu ).to.be.equal( tree.children[ 0 ].menu );)
 * ```
 *
 * @param tree The dropdown menu tree to clone.
 * @returns The shallow clone of the dropdown menu tree.
 */
export function shallowCloneDropdownMenuTree( tree: DropdownMenusViewsTreeNode ): DropdownMenusViewsTreeNode {
	return cloneDeepWith( tree, ( element ): any => {
		if ( typeof element === 'object' && element instanceof View ) {
			return element;
		}
	} );
}

/**
 * Tries to remove a child from a dropdown menu tree node.
 *
 * ```ts
 * const tree = createTreeFromDropdownMenuView( menuView );
 * const child = tree.children[ 0 ].children[ 0 ];
 * const updatedTree = tryRemoveDropdownMenuTreeChild( tree.children[ 0 ], child );
 *
 * expect( updatedTree ).to.deep.equal( {
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
 * 				// First child has been removed.
 * 			]
 * 		}
 * 	]
 * } );
 * ```
 *
 * @param parent The parent node. This argument will be modified.
 * @param child The child node to be removed.
 * @returns The updated parent node.
 */
export function tryRemoveDropdownMenuTreeChild<P extends DropdownMenusViewsTreeNode>(
	parent: P,
	child: DropdownMenuViewsTreeChildItem
): P {
	switch ( parent.type ) {
		case 'Item':
			/* NOP */
			break;

		case 'Menu':
		case 'Root': {
			const index = parent.children.indexOf( child );

			if ( index !== -1 ) {
				parent.children.splice( index, 1 );
			}
		} break;

		default: {
			const unknownNode: never = parent;
			throw new Error( `Unknown node type! ${ unknownNode }` );
		}
	}

	return parent;
}

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
 * 			type: 'Menu',
 * 			search: {
 * 				raw: 'Menu 1',
 * 				text: 'menu 1'
 * 			},
 * 			menu: new DropdownMenuView( ... ),
 * 			children: [ ... ]
 * 		},
 * 		children: [
 * 			{
 * 				type: 'Item',
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
		const maybeFirstFoundParent = [ ...parents ].reverse().find( item => item.type !== 'Root' && item.found );

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
			if ( node.type !== 'Item' ) {
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
