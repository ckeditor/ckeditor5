/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/walkoverdropdownmenutreeitems
 */

import type { NonEmptyArray } from '@ckeditor/ckeditor5-core';
import type {
	DropdownMenusViewsTreeNode,
	DropdownMenusViewsTreeNodeKind,
	ExtractDropdownMenuViewTreeNodeByKind
} from './tree/dropdownsearchtreetypings.js';

/**
 * Walks over the tree of dropdown menu items and invokes the provided walkers for each node.
 *
 * ```ts
 * const tree = createTreeFromDropdownMenuView( menuView );
 *
 * // Inline walker function for the `Item` node kind.
 * walkOverDropdownMenuTreeItems( {
 * 	Item: ( { node, parents, parent } ) => {
 * 		// Exec something after entering `Item` node.
 * 	},
 * }, tree );
 *
 * // Abort walking over the tree children.
 * walkOverDropdownMenuTreeItems( {
 * 	Menu: ( { node, parents, parent } ) => {
 * 		// Do not walk through it's children.
 * 		return false;
 * 	},
 * }, tree );
 *
 * // `enter` and `leave` functions for the `Menu` node kind.
 * walkOverDropdownMenuTreeItems( {
 * 	Menu: {
 * 		enter: ( { node, parents, parent } ) => {
 * 			// Exec something after entering `Menu` node.
 * 		},
 * 		leave: ( { node, parents, parent } ) => {
 * 			// Exec something after leaving `Menu` node.
 * 		}
 * 	}
 * }, tree );
 *
 * // Default walker for all node kinds.
 * walkOverDropdownMenuTreeItems( {
 * 	Default: ( { node, parents, parent } ) => {
 * 		// Exec something for all node kinds.
 * 	}
 * }, tree );
 * ```
 *
 * @template Extend The type of additional data that can be passed to the walkers.
 * @param walkers The walkers to be invoked for each node.
 * @param root The root node of the dropdown menu tree.
 */
export function walkOverDropdownMenuTreeItems<Extend>(
	walkers: DropdownMenuViewsTreeWalkers<Extend>,
	root: DropdownMenusViewsTreeNode<Extend>
): void {
	// Initialize an array to keep track of parent nodes
	const parents: Array<DropdownMenusViewsTreeNode<Extend>> = [];

	// Define a visitor function that will be called for each node
	const visitor: DropdownMenuViewsTreeVisitor = node => {
		// Get the walker functions for the current node kind
		const {
			enter = () => {},
			leave = () => {}
		} = ( () => {
			const walkerOrCallback = walkers[ node.kind ] || walkers.Default || {};

			if ( typeof walkerOrCallback === 'function' ) {
				return {
					enter: walkerOrCallback
				};
			}

			return walkerOrCallback;
		} )() as DropdownMenuViewsTreeWalker;

		// Create metadata object for the current node
		const walkerMetadata: DropdownMenuViewsTreeWalkerMetadata = {
			parents: [ ...parents ] as any,
			parent: ( parents[ parents.length - 1 ] || null ) as any,
			node,
			visitor
		};

		// Add the current node to the parents array.
		parents.push( node );

		// Call the enter function for the current node
		const result = enter( walkerMetadata );

		// Process the children of the current node based on its kind
		if ( result !== false ) {
			switch ( node.kind ) {
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

				default: {
					const unknownNode: never = node;
					throw new Error( `Unknown node kind: ${ unknownNode }` );
				}
			}
		}

		// Call the leave function for the current node
		leave( walkerMetadata );

		// Remove the current node from the parents array if it's not the root node
		parents.pop();
	};

	// Start the traversal by calling the visitor function for the root node
	visitor( root );
}

/**
 * Metadata object for the walker function.
 *
 * @template K The type of dropdown menu node kind.
 * @template Extend The type of additional data that can be passed to the walkers.
 */
export type DropdownMenuViewsTreeWalkerMetadata<
	K extends DropdownMenusViewsTreeNodeKind = DropdownMenusViewsTreeNodeKind,
	Extend = unknown
> =
	& {
		visitor: DropdownMenuViewsTreeVisitor;
		node: ExtractDropdownMenuViewTreeNodeByKind<K, Extend>;
	}
	& (
		K extends 'Root' ? {
			// The root node has no parent.
			parents: [];
			parent: null;
		} : {
			// The parent nodes and the parent node for the current node.
			parents: NonEmptyArray<DropdownMenusViewsTreeNode<Extend>>;
			parent: DropdownMenusViewsTreeNode<Extend>;
		}
	);

/**
 * Represents a tree walker for navigating through the views of a dropdown menu.
 *
 * @template K The type of dropdown menu views tree node kind.
 * @template Extend Additional data type for extending the tree walker.
 */
export type DropdownMenuViewsTreeWalker<
	K extends DropdownMenusViewsTreeNodeKind = DropdownMenusViewsTreeNodeKind,
	Extend = unknown
> = {

	/**
	 * Function called when entering a node.
	 *
	 * @param entry - The metadata object for the current node.
	 * @returns A boolean value indicating whether to continue traversing the tree.
	 *          Returning `true` will continue to the next node, while returning `false` will stop the traversal.
	 */
	// eslint-disable-next-line @typescript-eslint/no-invalid-void-type
	enter?: ( entry: DropdownMenuViewsTreeWalkerMetadata<K, Extend> ) => boolean | void;

	/**
	 * Function called when leaving a node.
	 *
	 * @param entry - The metadata object for the current node.
	 */
	leave?: ( entry: DropdownMenuViewsTreeWalkerMetadata<K, Extend> ) => void;
};

/**
 * Visitor function for the dropdown menu tree.
 *
 * @param node The current dropdown menu node.
 */
type DropdownMenuViewsTreeVisitor = ( node: DropdownMenusViewsTreeNode ) => void;

/**
 * Object containing all the walkers for different dropdown menu node kinds.
 *
 * @template Extend The type of additional data that can be passed to the walkers.
 */
export type DropdownMenuViewsTreeWalkers<Extend = unknown> =
	& {
		[K in DropdownMenusViewsTreeNodeKind]?:
			| DropdownMenuViewsTreeWalker<K, Extend>
			| DropdownMenuViewsTreeWalker<K, Extend>['enter'];
	}
	& {
		Default?:
			| DropdownMenuViewsTreeWalker<DropdownMenusViewsTreeNodeKind, Extend>
			| DropdownMenuViewsTreeWalker<DropdownMenusViewsTreeNodeKind, Extend>['enter'];
	};
