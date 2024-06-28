/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menubar/menubarmenulistview
 */

import type { Locale } from '@ckeditor/ckeditor5-utils';
import type View from '../view.js';

import ListItemView from '../list/listitemview.js';
import ListView from '../list/listview.js';
import ListItemButtonView from '../button/listitembuttonview.js';
import ButtonView from '../button/buttonview.js';

/**
 * A list of menu bar items, a child of {@link module:ui/menubar/menubarmenuview~MenuBarMenuView#panelView}.
 *
 * Use this class to create a list of items (options, buttons) to be displayed in a menu bar.
 *
 * To populate this list, use {@link module:ui/menubar/menubarmenulistitemview~MenuBarMenuListItemView} instances.
 */
export default class MenuBarMenuListView extends ListView {
	/**
	 * Creates an instance of the list view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		this.role = 'menu';
		this.items.on( 'change', this._setItemsCheckSpace.bind( this ) );
	}

	/**
	 * This method adds empty space if there is any toggleable item in the list.
	 * It makes the list properly aligned.
	 */
	private _setItemsCheckSpace() {
		const hasAnyToggleableItem = (
			Array
				.from( this.items )
				.some( item => {
					const listButtonView = pickListButtonMenuViewIfPresent( item );

					return listButtonView && listButtonView.isToggleable;
				} )
		);

		this.items.forEach( item => {
			const listButtonView = pickListButtonMenuViewIfPresent( item );

			if ( listButtonView ) {
				listButtonView.hasCheckSpace = hasAnyToggleableItem;
			}
		} );
	}
}

/**
 * Picks the first button menu view from the given item if present.
 *
 * @param item The item to check for a button menu view.
 * @returns The first button menu view found in the item, or `null` if not found.
 */
function pickListButtonMenuViewIfPresent( item: View ) {
	if ( !( item instanceof ListItemView ) ) {
		return null;
	}

	return (
		item
			.children
			.map( child => isNestedMenuLikeView( child ) ? child.buttonView : child )
			.find( item => item instanceof ListItemButtonView ) as ListItemButtonView | undefined
	);
}

/**
 * Checks if the given item is a nested menu-like view. `MenuBarMenuView` imports this file
 * so to avoid circular dependencies, this function is defined in more generic way.
 *
 * @param item The item to check.
 * @returns `true` if the item is a nested menu-like view, `false` otherwise.
 */
function isNestedMenuLikeView( item: any ): item is { buttonView: ButtonView } {
	return (
		typeof item === 'object' &&
			'buttonView' in item &&
			item.buttonView instanceof ButtonView
	);
}
