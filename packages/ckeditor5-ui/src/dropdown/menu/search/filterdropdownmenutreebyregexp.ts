/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/search/filterdropdownmenutreebyregexp
 */

import type { DeepReadonly } from '@ckeditor/ckeditor5-core';
import type { DropdownMenuViewsRootTree } from './tree/dropdownsearchtreetypings.js';

import { filterDropdownMenuTree, type DropdownMenuSearchResult } from './filterdropdownmenutree.js';

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
 * 	kind: 'Root',
 * 	children: [
 * 		{
 *
 * 			kind: 'Menu 1',
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
export const filterDropdownMenuTreeByRegExp = (
	regExp: RegExp | null,
	tree: DeepReadonly<DropdownMenuViewsRootTree>
): DropdownMenuSearchResult =>
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
