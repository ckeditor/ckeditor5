/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	MenuBarMenuListItemButtonView,
	MenuBarMenuView,
	MenuBarMenuListView,
	MenuBarMenuListItemView
} from '../../../src/index.js';
import ListSeparatorView from '../../../src/list/listseparatorview.js';

/**
 * Returns an abstract object representation of the menu bar structure with submenus and items (and their state).
 *
 * Please note that (for performance reasons) menu bar menus are loaded on demand when the user interacts with them
 * so the dump will contain only the visible (already rendered) structure of the menu bar. Open menus to
 * reveal more nodes or use the `fullDump` option to get the full menu bar structure.
 *
 * @param menuBarView The menu bar view which structure should be dumped.
 * @param options
 * @param options.fullDump `false` by default. When set `true`, this helper will open all sub-menus recursively
 * and return the full menu bar structure. Please note that you will not be able rely on the `isOpen` property's value
 * in the dump, if you run the helper this way.
 */
export function barDump( menuBarView, options ) {
	return menuBarView.children.map( child => menuDump( child, options ) );
}

/**
 * Finds a menu bar's menu by its label and returns the instance.
 *
 * Please note that (for performance reasons) menu bar menus are loaded on demand when the user interacts with them
 * and sub-menus in a parent menu that has not been opened yet will not be found.
 */
export function getMenuByLabel( menuBarView, label ) {
	return menuBarView.menus.find( menuView => menuView.buttonView.label === label );
}

/**
 * Finds a menu bar's menu list item by its label and returns the instance.
 *
 * Please note that (for performance reasons) menu bar menus are loaded on demand when the user interacts with them
 * and items in a parent menu that has not been opened yet will not be found.
 */
export function getItemByLabel( menuBarView, label ) {
	for ( const menuView of menuBarView.menus ) {
		for ( const listItemView of menuView.panelView.children.first.items ) {
			if ( listItemView.children.first.label === label ) {
				return listItemView;
			}
		}
	}
}

/**
 * Returns a component factory-friendly callback that creates a menu button of a given label.
 */
export function getButtonCreator( label, locale ) {
	return () => {
		const buttonView = new MenuBarMenuListItemButtonView( locale );
		buttonView.label = label;
		return buttonView;
	};
}

/**
 * Returns a component factory-friendly callback that creates a menu.
 * This callback creates a menu containing the provided items, which should either be valid menu items or callbacks to create them.
 */
export function getMenuCreator( definition, locale ) {
	const { label, items } = definition;

	return () => {
		const menuView = new MenuBarMenuView( locale );
		menuView.buttonView.label = label;

		const menuBarMenuListView = new MenuBarMenuListView( locale );

		items.forEach( item => {
			const listItemView = new MenuBarMenuListItemView( locale, menuView );
			const subMenuView = typeof item === 'function' ? item() : item;

			listItemView.children.add( subMenuView );
			menuBarMenuListView.items.add( listItemView );
		} );

		menuView.panelView.children.add( menuBarMenuListView );

		return menuView;
	};
}

function menuDump( menuView, options = {} ) {
	const { fullDump } = options;

	if ( fullDump ) {
		menuView.isOpen = true;
	}

	let menuItems = [];

	if ( menuView.panelView.children.first ) {
		menuItems = menuView.panelView.children.first.items.map( listItemOrSeparatorView => {
			if ( listItemOrSeparatorView instanceof ListSeparatorView ) {
				return '-';
			}

			const view = listItemOrSeparatorView.children.first;

			if ( view instanceof MenuBarMenuView ) {
				return menuDump( view, options );
			} else {
				return {
					label: view.label,
					isFocused: document.activeElement === view.element
				};
			}
		} );
	}

	return {
		label: menuView.buttonView.label,
		isOpen: menuView.isOpen,
		isFocused: document.activeElement === menuView.buttonView.element,
		items: menuItems
	};
}
