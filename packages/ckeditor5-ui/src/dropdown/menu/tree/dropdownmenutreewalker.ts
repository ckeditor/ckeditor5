/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/tree/dropdownmenutreewalker
 */

import type { DropdownMenusViewsTreeNode } from './dropdownmenutreetypings.js';

/**
 * Walks over the tree of dropdown menu items and invokes the provided walker for each node.
 *
 * @param walker The walker to be invoked for each node.
 * @param root The root node of the dropdown menu tree.
 */
export function walkOverDropdownMenuTreeItems(
	walker: ( node: DropdownMenusViewsTreeNode ) => void,
	root: DropdownMenusViewsTreeNode
): void {
	// Initialize an array to keep track of parent nodes
	const parents: Array<DropdownMenusViewsTreeNode> = [];

	// Define a visitor function that will be called for each node
	const visitor: DropdownMenuViewsTreeVisitor = node => {
		// Add the current node to the parents array.
		parents.push( node );

		// Call the enter function for the current node
		walker( node );

		// Process the children of the current node based on its type
		switch ( node.type ) {
			case 'Item':
				// Do not do anything. Items have no children.
				break;

			case 'Menu':
			case 'Root':
				for ( let i = 0; i < node.children.length; ) {
					const child = node.children[ i ];

					// Call the visitor function for each child node
					visitor( child );

					// If the child node was not removed, increment the index
					if ( child === node.children[ i ] ) {
						++i;
					}
				}
				break;
		}

		// Remove the current node from the parents array if it's not the root node
		parents.pop();
	};

	// Start the traversal by calling the visitor function for the root node
	visitor( root );
}

/**
 * Visitor function for the dropdown menu tree.
 *
 * @param node The current dropdown menu node.
 */
type DropdownMenuViewsTreeVisitor = ( node: DropdownMenusViewsTreeNode ) => void;
