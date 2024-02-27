/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import {
	MenuBarMenuListItemButtonView,
	MenuBarMenuView
} from '../../../src/index.js';
import ListSeparatorView from '../../../src/list/listseparatorview.js';

export function barDump( menuBarView, options ) {
	return menuBarView.children.map( child => menuDump( child, options ) );
}

export function getMenuByLabel( menuBarView, label ) {
	return menuBarView.menus.find( menuView => menuView.buttonView.label === label );
}

export function getItemByLabel( menuBarView, label ) {
	for ( const menuView of menuBarView.menus ) {
		for ( const listItemView of menuView.panelView.children.first.items ) {
			if ( listItemView.children.first.label === label ) {
				return listItemView;
			}
		}
	}
}

export function getButtonCreator( label, locale ) {
	return () => {
		const buttonView = new MenuBarMenuListItemButtonView( locale );
		buttonView.label = label;
		return buttonView;
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
