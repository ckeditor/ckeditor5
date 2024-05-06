/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/tryremovedropdownmenutreechild
 */

import type {
	DropdownMenuViewsTreeChildItem,
	DropdownMenusViewsTreeNode
} from './tree/dropdownsearchtreetypings.js';

/**
 * Tries to remove a child from a dropdown menu tree node.
 *
 * ```ts
 * const tree = createTreeFromDropdownMenuView( menuView );
 * const child = tree.children[ 0 ].children[ 0 ];
 * const updatedTree = tryRemoveDropdownMenuTreeChild( tree, child );
 *
 * expect( updatedTree ).to.deep.equal( {
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
	switch ( parent.kind ) {
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
			throw new Error( `Unknown node kind! ${ unknownNode }` );
		}
	}

	return parent;
}
