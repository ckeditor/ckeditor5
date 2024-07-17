/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenubehaviors
 */

import type { BaseEvent, ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';
import type DropdownNestedMenuView from './dropdownnestedmenuview.js';
import type { FocusableView } from '../../focuscycler.js';

import type { ButtonExecuteEvent } from '../../button/button.js';
import type DropdownMenuRootListView from './dropdownmenurootlistview.js';

import DropdownMenuListItemView from './dropdownmenulistitemview.js';

export const DropdownRootMenuBehaviors = {
	/**
	 * Move focus to a menu item on mouse hover. If it is a button to open a nested menu, open that menu.
	 */
	toggleMenusAndFocusItemsOnHover( rootList: DropdownMenuRootListView ): void {
		rootList.on<DropdownMenuMouseEnterEvent>( 'menu:mouseenter', evt => {
			const [ pathLeaf ] = evt.path;

			( evt.source as FocusableView ).focus();

			for ( const menuView of rootList.menus ) {
				const isListItemContainingMenu = pathLeaf instanceof DropdownMenuListItemView && pathLeaf.childView === menuView;

				menuView.isOpen = ( evt.path.includes( menuView ) || isListItemContainingMenu ) && menuView.isEnabled;
			}
		} );
	},

	/**
	 * Handles the following case:
	 *
	 * 1. Hover to open a sub-menu (A). The button has focus.
	 * 2. Press arrow up/down to move focus to another sub-menu (B) button.
	 * 3. Press arrow right to open the sub-menu (B).
	 * 4. The sub-menu (A) should close (if not, there are two open menus).
	 */
	closeMenuWhenAnotherOnTheSameLevelOpens( rootList: DropdownMenuRootListView ): void {
		rootList.on<DropdownMenuChangeIsOpenEvent>( 'menu:change:isOpen', ( evt, name, isOpen ) => {
			if ( !isOpen ) {
				return;
			}

			const evtMenu = evt.source as DropdownNestedMenuView;

			for ( const menuView of rootList.menus ) {
				if ( evtMenu.parentMenuView === menuView.parentMenuView && evtMenu !== menuView ) {
					menuView.isOpen = false;
				}
			}
		} );
	}
};

export const DropdownMenuBehaviors = {
	/**
	 * Open the menu on the right arrow key press (left, in RTL mode). This allows for navigating to sub-menus using the keyboard.
	 */
	openOnArrowRightKey( menuView: DropdownNestedMenuView ): void {
		const keystroke = menuView.locale!.uiLanguageDirection === 'rtl' ? 'arrowleft' : 'arrowright';

		menuView.keystrokes.set( keystroke, ( data, cancel ) => {
			if ( menuView.focusTracker.focusedElement !== menuView.buttonView.element || !menuView.isEnabled ) {
				return;
			}

			if ( !menuView.isOpen ) {
				menuView.isOpen = true;
			}

			menuView.panelView.focus();
			cancel();
		} );
	},

	/**
	 * Opens the menu on its button click as well as enter and space keys press (if the button is focused).
	 */
	openOnButtonClick( menuView: DropdownNestedMenuView ): void {
		menuView.buttonView.on<ButtonExecuteEvent>( 'execute', () => {
			if ( menuView.isEnabled ) {
				menuView.isOpen = true;
				menuView.panelView.focus();
			}
		} );
	},

	/**
	 * Closes the menu on the left key press (right, in RTL mode). This allows for navigating to sub-menus using the keyboard.
	 */
	closeOnArrowLeftKey( menuView: DropdownNestedMenuView ): void {
		const keystroke = menuView.locale!.uiLanguageDirection === 'rtl' ? 'arrowright' : 'arrowleft';

		menuView.keystrokes.set( keystroke, ( data, cancel ) => {
			if ( menuView.isOpen ) {
				menuView.isOpen = false;
				menuView.focus();
				cancel();
			}
		} );
	},

	/**
	 * Closes the menu when its parent menu closes. This prevents from leaving orphaned open menus.
	 */
	closeOnParentClose( menuView: DropdownNestedMenuView, parentMenuView: DropdownNestedMenuView ): void {
		parentMenuView.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
			// TODO: Remove checking `evt.source` if `change:isOpen` is no longer delegated.
			if ( !isOpen && evt.source === parentMenuView ) {
				menuView.isOpen = false;
			}
		} );
	}
};

/**
 * Represents a dropdown menu mouse enter event.
 */
interface DropdownMenuMouseEnterEvent extends BaseEvent {

	/**
	 * The name of the event.
	 */
	name: 'menu:mouseenter';
}

/**
 * Represents a dropdown menu change is open event.
 */
interface DropdownMenuChangeIsOpenEvent extends BaseEvent {

	/**
	 * The name of the event.
	 */
	name: 'menu:change:isOpen';

	/**
	 * The arguments of the event.
	 */
	args: [ name: string, value: boolean, oldValue: boolean ];
}
