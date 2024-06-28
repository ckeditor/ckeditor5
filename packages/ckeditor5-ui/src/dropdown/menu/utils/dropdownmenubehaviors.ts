/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/utils/dropdownmenubehaviors
 */

import type { ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';
import type DropdownMenuView from '../dropdownmenuview.js';
import type { FocusableView } from '../../../focuscycler.js';
import type {
	DropdownMenuMouseEnterEvent,
	DropdownMenuChangeIsOpenEvent
} from '../events.js';

import type { ButtonExecuteEvent } from '../../../button/button.js';
import type DropdownMenuRootListView from '../dropdownmenurootlistview.js';

import DropdownMenuListItemView from '../dropdownmenulistitemview.js';
import clickOutsideHandler from '../../../bindings/clickoutsidehandler.js';

const hasMenuViewFocus = ( menuView: DropdownMenuView ) =>
	menuView.panelView.element!.contains( document.activeElement ) ||
		menuView.element!.contains( document.activeElement );

export const DropdownRootMenuBehaviors = {
	/**
	 * Closes the menu when an element outside the menu is focused.
	 */
	closeWhenOutsideElementFocused( rootList: DropdownMenuRootListView ): void {
		rootList.listenTo( document, 'focus', () => {
			if ( !rootList.element || rootList.element.contains( document.activeElement ) ) {
				return;
			}

			// We don't want to close dropdown if it's mounted somewhere in body and receives focus.
			if ( !rootList.menus.some( hasMenuViewFocus ) ) {
				rootList.close();
			}
		}, { useCapture: true } );
	},

	/**
	 * When the bar is already open:
	 *
	 * * Opens the menu when the user hovers over its button.
	 * * Closes open menu when another menu's button gets hovered.
	 */
	toggleMenusAndFocusItemsOnHover( rootList: DropdownMenuRootListView ): void {
		rootList.on<DropdownMenuMouseEnterEvent>( 'menu:mouseenter', evt => {
			const [ pathLeaf ] = evt.path;
			const { menus } = rootList;

			const isAnyOtherAlreadyOpen = !!document.activeElement && menus.some(
				menuView => (
					menuView !== evt.source &&
					menuView.isOpen &&
					hasMenuViewFocus( menuView )
				)
			);

			// Make focus and keyboard feel a bit better. Basically dropdown search input is still focused during hovering
			// menu items. This is not super intuitive when user opens any menu entry using click. In that situation
			// input loses its focus and newly opened menu entry gets it. The problem is that if user closes
			// newly opened menu, e.g by hovering into another one, the whole dropdown will close due to focus loss.
			// Check implementation of closeDropdownOnBlur to further information.
			if ( isAnyOtherAlreadyOpen ) {
				( evt.source as FocusableView ).focus();
			}

			for ( const menuView of menus ) {
				const isListItemContainingMenu = pathLeaf instanceof DropdownMenuListItemView &&
					pathLeaf.childView === menuView;

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
	 * 4. The sub-menu (A) should close as it would with `toggleMenusAndFocusItemsOnHover()`.
	 */
	closeMenuWhenAnotherOnTheSameLevelOpens( rootList: DropdownMenuRootListView ): void {
		rootList.on<DropdownMenuChangeIsOpenEvent>( 'menu:change:isOpen', ( evt, name, isOpen ) => {
			if ( !isOpen ) {
				return;
			}

			const evtMenu = evt.source as DropdownMenuView;

			for ( const menuView of rootList.menus ) {
				if (
					evtMenu.parentMenuView === menuView.parentMenuView &&
					evtMenu !== menuView &&
					menuView.isOpen
				) {
					menuView.isOpen = false;
				}
			}
		} );
	},

	/**
	 * Closes the bar when the user clicked outside of it (page body, editor root, etc.).
	 */
	closeOnClickOutside( rootList: DropdownMenuRootListView ): void {
		clickOutsideHandler( {
			listenerOptions: {
				priority: 'high'
			},
			emitter: rootList,
			activator: () => rootList.isOpen,
			callback: () => rootList.close(),
			contextElements: () => rootList.menus
				.flatMap(
					child => [
						child.element!,
						child.panelView.element!
					]
				)
				.filter( Boolean )
		} );
	}
};

export const DropdownMenuBehaviors = {
	/**
	 * Open the menu on the right arrow key press. This allows for navigating to sub-menus using the keyboard.
	 */
	openOnArrowRightKey( menuView: DropdownMenuView ): void {
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
	 * Toggles the menu on its button click. This behavior is analogous to {@link module:ui/dropdown/dropdownview~DropdownView}.
	 */
	openOnButtonClick( menuView: DropdownMenuView ): void {
		menuView.buttonView.on<ButtonExecuteEvent>( 'execute', () => {
			if ( menuView.isEnabled ) {
				menuView.isOpen = true;
				menuView.panelView.focus();
			}
		} );
	},

	/**
	 * Closes the menu on the right left key press. This allows for navigating to sub-menus using the keyboard.
	 */
	closeOnArrowLeftKey( menuView: DropdownMenuView ): void {
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
	 * Closes the menu when its parent menu also closed. This prevents from orphaned open menus when the parent menu re-opens.
	 */
	closeOnParentClose( menuView: DropdownMenuView, parentMenuView: DropdownMenuView ): void {
		parentMenuView.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
			if ( !isOpen && evt.source === parentMenuView ) {
				menuView.isOpen = false;
			}
		} );
	}
};
