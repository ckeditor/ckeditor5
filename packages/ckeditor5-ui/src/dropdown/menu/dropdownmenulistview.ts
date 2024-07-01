/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenulistview
 */

import { global, type Locale } from '@ckeditor/ckeditor5-utils';

import type { DropdownMenuViewsRootTree } from './tree/dropdownmenutreetypings.js';
import type View from '../../view.js';
import type DropdownMenuListItemButtonView from './dropdownmenulistitembuttonview.js';

import ListView from '../../list/listview.js';

import { createTreeFromDropdownMenuView } from './tree/dropdownmenutreecreateutils.js';
import { walkOverDropdownMenuTreeItems, type DropdownMenuViewsTreeWalkers } from './tree/dropdownmenutreewalker.js';
import DropdownMenuListItemView from './dropdownmenulistitemview.js';
import ListItemButtonView from '../../button/listitembuttonview.js';

/**
 * Represents a dropdown menu list view.
 */
export default class DropdownMenuListView extends ListView {
	/**
	 * Represents whether the dropdown menu list view is visible or not.
	 */
	declare public isVisible: boolean;

	/**
	 * Indicates whether the dropdown has been interacted with using the keyboard.
	 *
	 * It is useful for showing focus outlines while hovering over the dropdown menu when
	 * interaction with the keyboard was detected.
	 *
	 * @observable
	 */
	declare public isFocusBorderEnabled: boolean;

	/**
	 * Indicates whether the list is scrollable.
	 *
	 * @internal
	 * @readonly
	 */
	declare public _isScrollable: boolean;

	/**
	 * Creates an instance of the dropdown menu list view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.role = 'menu';
		this.set( {
			_isScrollable: false,
			isVisible: true,
			isFocusBorderEnabled: false
		} );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-dropdown-menu',
					bind.if( 'isVisible', 'ck-hidden', value => !value ),
					bind.if( 'isFocusBorderEnabled', 'ck-dropdown-menu_focus-border-enabled' ),
					bind.if( '_isScrollable', 'ck-dropdown-menu_scrollable' )
				]
			}
		} );

		// We need to listen on window resize event and update scrollable flag..
		this.listenTo( global.window, 'resize', () => this.checkIfScrollable() );
		this.items.on( 'change', () => {
			this.checkIfScrollable();
			this._setItemsCheckSpace();
		} );
	}

	/**
	 * Gets the tree representation of the dropdown menu views.
	 *
	 * @returns The tree representation of the dropdown menu views.
	 */
	public get tree(): DropdownMenuViewsRootTree {
		return createTreeFromDropdownMenuView( {
			menuItems: [ ...this.items ]
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();
		this.checkIfScrollable();
		this._setItemsCheckSpace();
	}

	/**
	 * Walks over the dropdown menu views using the specified walkers.
	 *
	 * @param walkers The walkers to use.
	 */
	public walk( walkers: DropdownMenuViewsTreeWalkers ): void {
		walkOverDropdownMenuTreeItems( walkers, this.tree );
	}

	/**
	 * Updates the `_isScrollable` flag based on the current list height.
	 *
	 * @internal
	 */
	public checkIfScrollable(): void {
		const listWrapper = this.element;

		if ( listWrapper ) {
			this._isScrollable = Math.max( listWrapper.scrollHeight, listWrapper.clientHeight ) > window.innerHeight * 0.8;
		}
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
 * Picks button view from menu list item.
 *
 * 	* If the item is a nested menu-like view, it will return the button view of the nested menu.
 * 	* If the item is a flat menu item, it will return the item itself.
 *
 * @param item The item to check for a button menu view.
 * @returns The first button menu view found in the item, or `null` if not found.
 */
function pickListButtonMenuViewIfPresent( item: View ): DropdownMenuListItemButtonView | null {
	if ( !( item instanceof DropdownMenuListItemView ) ) {
		return null;
	}

	const { childView } = item;

	if ( isNestedMenuLikeView( childView ) ) {
		return childView.buttonView;
	}

	return childView;
}

/**
 * Checks if the given item is a nested menu-like view. `DropdownMenuView` imports this file
 * so to avoid circular dependencies, this function is defined in more generic way.
 *
 * @param item The item to check.
 * @returns `true` if the item is a nested menu-like view, `false` otherwise.
 */
function isNestedMenuLikeView( item: any ): item is { buttonView: ListItemButtonView } {
	return (
		typeof item === 'object' &&
			'buttonView' in item &&
			item.buttonView instanceof ListItemButtonView
	);
}
