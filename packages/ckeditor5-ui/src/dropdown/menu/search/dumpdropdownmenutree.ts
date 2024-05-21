/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/dumpdropdownmenutree
 */

import type {
	DropdownMenuViewsRootTree,
	DropdownMenusViewsTreeNode
} from './tree/dropdownsearchtreetypings.js';

import { walkOverDropdownMenuTreeItems } from './walkoverdropdownmenutreeitems.js';

/**
 * Dumps the dropdown menu tree into a string.
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
 * const dump = dumpDropdownMenuTree( tree );
 *
 * expect( dump ).to.equal( `<Root>
 *   <Menu 1>
 *     <Item raw="Button" text="button" />
 *   </Menu 1>
 * </Root>` );
 * ```
 *
 * @param tree The dropdown menu tree to dump.
 * @returns The string representation of the dropdown menu tree.
 */
export function dumpDropdownMenuTree( tree: Readonly<DropdownMenuViewsRootTree> ): string {
	const lines: Array<string> = [];
	let lastEnteredNode: DropdownMenusViewsTreeNode | null = null;

	const formatAttributes = ( attributes: object ) =>
		Object
			.entries( attributes )
			.map( ( [ key, value ] ) => ` ${ key }="${ value }"` )
			.join( '' );

	walkOverDropdownMenuTreeItems( {
		Default: {
			enter: ( { node, parents } ) => {
				const nesting = '  '.repeat( parents.length );
				const attributes = node.kind === 'Root' ? '' : formatAttributes( node.search );

				lastEnteredNode = node;
				lines.push( `${ nesting }<${ node.kind }${ attributes }>` );

				// Skip walking into not initialized menus.
				if ( node.kind === 'Menu' && node.menu.pendingLazyInitialization ) {
					return false;
				}
			},
			leave: ( { node, parents } ) => {
				if ( lastEnteredNode === node ) {
					// It's self enclosing tag. Like this one: <Item />
					lines[ lines.length - 1 ] = lines[ lines.length - 1 ].replace( />$/, ' />' );
				} else {
					// It's tag with children. Like this one: <Menu>...</Menu>
					const nesting = '  '.repeat( parents.length );

					lines.push( `${ nesting }</${ node.kind }>` );
				}
			}
		}
	}, tree );

	return lines.join( '\n' );
}
