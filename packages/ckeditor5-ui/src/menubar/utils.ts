/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menubar/utils
 */

import clickOutsideHandler from '../bindings/clickoutsidehandler.js';
import type MenuBarMenuView from './menubarmenuview.js';
import type MenuBarView from './menubarview.js';
import type { FocusableView } from '../focuscycler.js';

export const EVENT_NAME_DELEGATES = [ 'mouseenter', 'arrowleft', 'arrowright', 'menuButtonFocus' ] as const;

export const MenuBarBehaviors = {
	closeOnClickOutside( menuBarView: MenuBarView ): void {
		clickOutsideHandler( {
			emitter: menuBarView,
			activator: () => menuBarView.isOpen,
			callback: () => menuBarView.close(),
			contextElements: () => menuBarView.children.map( child => child.element! )
		} );
	},

	toggleMenusAndFocusItemsOnHover( menuBarView: MenuBarView ): void {
		menuBarView.on( 'mouseenter', evt => {
			// This works only when the menu bar has already been open and the user hover over the menu bar.
			if ( !menuBarView.isOpen ) {
				return;
			}

			for ( const menuView of menuBarView.menus ) {
				menuView.isOpen = evt.path.includes( menuView );
			}

			( evt.source as FocusableView ).focus();
		} );
	},

	focusCycleMenusOnArrows( menuBarView: MenuBarView ): void {
		menuBarView.on( 'arrowright', evt => cycleTopLevelMenus( evt.source as MenuBarMenuView, 1 ) );
		menuBarView.on( 'arrowleft', evt => cycleTopLevelMenus( evt.source as MenuBarMenuView, -1 ) );

		function cycleTopLevelMenus( currentMenuView: MenuBarMenuView, step: number ) {
			const currentIndex = menuBarView.children.getIndex( currentMenuView );
			const isCurrentMenuViewOpen = currentMenuView.isOpen;
			const menusCount = menuBarView.children.length;
			const menuViewToOpen = menuBarView.children.get( ( currentIndex + menusCount + step ) % menusCount )!;

			currentMenuView.isOpen = false;

			if ( isCurrentMenuViewOpen ) {
				menuViewToOpen.isOpen = true;
			}

			menuViewToOpen.buttonView.focus();
		}
	},

	closeMenusOnClose( menuBarView: MenuBarView ): void {
		menuBarView.on( 'change:isOpen', () => {
			if ( !menuBarView.isOpen ) {
				menuBarView.menus.forEach( menuView => {
					menuView.isOpen = false;
				} );
			}
		} );
	}
};

export const MenuBarMenuBehaviors = {
	openAndFocusPanelOnArrowDownKey( menuView: MenuBarMenuView ): void {
		menuView.keystrokes.set( 'arrowdown', ( data, cancel ) => {
			if ( menuView.focusTracker.focusedElement === menuView.buttonView.element ) {
				if ( !menuView.isOpen ) {
					menuView.isOpen = true;
				}

				menuView.panelView.focus();
				cancel();
			}
		} );
	},

	/**
	 * Allow navigating to sub-menus using the arrow right key.
	 */
	openOnArrowRightKey( menuView: MenuBarMenuView ): void {
		// TODO: RTL
		menuView.keystrokes.set( 'arrowright', ( data, cancel ) => {
			if ( menuView.focusTracker.focusedElement !== menuView.buttonView.element ) {
				return;
			}

			if ( !menuView.isOpen ) {
				menuView.isOpen = true;
			}

			menuView.panelView.focus();
			cancel();
		} );
	},

	openOnButtonClick( menuView: MenuBarMenuView ): void {
		menuView.buttonView.on( 'open', () => {
			menuView.isOpen = true;

			menuView.panelView.focus();
		} );
	},

	toggleOnButtonClick( menuView: MenuBarMenuView ): void {
		menuView.buttonView.on( 'open', () => {
			menuView.isOpen = !menuView.isOpen;

			if ( menuView.isOpen ) {
				menuView.panelView.focus();
			}
		} );
	},

	/**
	 * In sub-menus, the button should work one-way only (open). Override the default toggle behavior.
	 */
	oneWayMenuButtonClickOverride( menuView: MenuBarMenuView ): void {
		menuView.buttonView.on( 'open', evt => {
			if ( menuView.isOpen ) {
				evt.stop();
			}
		}, { priority: 'high' } );
	},

	closeOnArrowLeftKey( menuView: MenuBarMenuView ): void {
		// TODO: RTL
		menuView.keystrokes.set( 'arrowleft', ( data, cancel ) => {
			if ( menuView.isOpen ) {
				menuView.isOpen = false;
				menuView.focus();
				cancel();
			}
		} );
	},

	closeOnEscKey( menuView: MenuBarMenuView ): void {
		menuView.keystrokes.set( 'esc', ( data, cancel ) => {
			if ( menuView.isOpen ) {
				menuView.isOpen = false;
				menuView.focus();
				cancel();
			}
		}, { priority: 'high' } );
	},

	closeOnParentClose( menuView: MenuBarMenuView ): void {
		menuView.parentMenuView!.on( 'change:isOpen', ( evt, name, isOpen ) => {
			if ( !isOpen ) {
				menuView.isOpen = false;
			}
		} );
	}
};
