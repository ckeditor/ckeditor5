/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/tree/dropdownmenutreecreateutils
 */

import DropdownMenuListItemView from '../dropdownmenulistitemview.js';

import DropdownMenuView from '../dropdownmenuview.js';
import DropdownMenuListItemButtonView from '../dropdownmenulistitembuttonview.js';

import type ViewCollection from '../../../viewcollection.js';
import type { DropdownNestedMenuListItemView } from '../typings.js';
import type {
	DropdownMenuViewsRootTree,
	DropdownMenuViewsTreeChildItem,
	TreeSearchMetadata
} from './dropdownmenutreetypings.js';

/**
 * Creates a tree structure from a DropdownMenuView.
 *
 * ```ts
 * const tree = createTreeFromDropdownMenuView( menuView );
 *
 * expect( tree ).to.deep.equal(
 * 	{
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
 * 						search: {
 * 							raw: 'Buttom',
 * 							text: 'button'
 * 						},
 * 						item: new DropdownMenuListItemButtonView( ... )
 * 					}
 * 				]
 * 			}
 * 		]
 * 	}
 * );
 * ```
 *
 * @param menu The DropdownMenuView to create the tree from.
 * @returns The root tree structure representing the DropdownMenuView.
 */
export function createTreeFromDropdownMenuView( menu: DropdownMenuViewLike ): DropdownMenuViewsRootTree {
	return {
		type: 'Root',
		children: Array.from( menu.menuItems ).flatMap( ( item ): Array<DropdownMenuViewsTreeChildItem> => {
			if ( !( item instanceof DropdownMenuListItemView ) ) {
				return [];
			}

			const { flatItemOrNestedMenuView } = item;

			if ( flatItemOrNestedMenuView instanceof DropdownMenuView ) {
				return [
					{
						type: 'Menu',
						search: createTextSearchMetadata( flatItemOrNestedMenuView.buttonView.label ),
						children: createTreeFromDropdownMenuView( flatItemOrNestedMenuView ).children,
						menu: flatItemOrNestedMenuView
					}
				];
			}

			if ( flatItemOrNestedMenuView instanceof DropdownMenuListItemButtonView ) {
				return [
					{
						type: 'Item',
						search: createTextSearchMetadata( flatItemOrNestedMenuView.label ),
						item: flatItemOrNestedMenuView
					}
				];
			}

			return [];
		} )
	};
}

/**
 * Represents a view-like object for a dropdown menu.
 */
type DropdownMenuViewLike = {
	menuItems: Array<DropdownNestedMenuListItemView> | ViewCollection<DropdownNestedMenuListItemView>;
};

/**
 * Creates text search metadata for a dropdown menu tree item.
 *
 * ```ts
 * const metadata = createTextSearchMetadata( '  Search Text  ' );
 *
 * expect( metadata ).to.deep.equal( {
 * 	raw: '  Search Text  ',
 * 	text: 'search text'
 * } );
 * ```
 *
 * @param label The label of the tree item.
 * @returns The created tree search metadata.
 */
export function createTextSearchMetadata( label: string | undefined ): TreeSearchMetadata {
	return {
		raw: label || '',
		text: normalizeSearchText( label || '' )
	};
}

/**
 * Normalizes the search text by removing leading and trailing whitespace and converting it to lowercase.
 *
 * ```ts
 * const normalizedText = normalizeSearchText( '  Search Text  ' );
 *
 * expect( normalizedText ).to.equal( 'search text' );
 * ```
 *
 * @param text The search text to be normalized.
 * @returns The normalized search text.
 */
export function normalizeSearchText( text: string ): string {
	return text.trim().toLowerCase();
}
