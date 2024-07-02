/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/utils/dropdownmenubehaviors
 */

import { global, type ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';
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

const hasFocusedMenuItem = ( rootList: DropdownMenuRootListView ) =>
	!!document.activeElement && rootList.menus.find( hasMenuViewFocus );

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

			( evt.source as FocusableView ).focus();

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
	},

	/**
	 * Tracks the keyboard focus interaction on the dropdown menu view. It is used to determine if the nested items
	 * of the dropdown menu should render focus rings after first interaction with the keyboard.
	 */
	enableFocusHighlightOnInteraction( rootList: DropdownMenuRootListView ): void {
		let isKeyPressed: boolean = false;

		rootList.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( _, evt, isOpen ) => {
			if ( !isOpen && !hasFocusedMenuItem( rootList ) ) {
				rootList.isFocusBorderEnabled = false;

				// Reset the flag when the dropdown menu is closed, menu items tend to intercept `keyup` event
				// and sometimes, after pressing `enter` on focused item, `isKeyPressed` stuck in `true` state.
				isKeyPressed = false;
			}
		} );

		// After clicking dropdown menu list item the focus is moved to the newly opened submenu.
		// We need to enable focus border for the submenu items because after pressing arrow down it will
		// focus second item instead of first which is not super intuitive.
		rootList.listenTo( global.document, 'click', () => {
			if ( rootList.isOpen && hasFocusedMenuItem( rootList ) ) {
				rootList.isFocusBorderEnabled = true;
			}
		}, { useCapture: true } );

		rootList.listenTo( global.document, 'keydown', () => {
			isKeyPressed = true;
		}, { useCapture: true } );

		rootList.listenTo( global.document, 'keyup', () => {
			isKeyPressed = false;
		}, { useCapture: true } );

		rootList.listenTo( global.document, 'focus', () => {
			if ( isKeyPressed && hasFocusedMenuItem( rootList ) ) {
				rootList.isFocusBorderEnabled = true;
			}
		}, { useCapture: true } );
	}
};

export const DropdownMenuBehaviors = {
	/**
	 * Open the menu on the right arrow key press (left, in RTL mode). This allows for navigating to sub-menus using the keyboard.
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
     * Opens the menu on its button click as well as enter and space keys press (if the button is focused).
     * This behavior is analogous to {@link module:ui/dropdown/dropdownview~DropdownView}.
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
	 * Closes the menu on the left key press (right, in RTL mode). This allows for navigating to sub-menus using the keyboard.
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
