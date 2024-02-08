/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menubar/utils
 */

import clickOutsideHandler from '../bindings/clickoutsidehandler.js';
import type MenuBarMenuView from './menubarmenuview.js';
import type {
	default as MenuBarView,
	MenuBarSubMenuMouseEnterEvent,
	MenuBarSubMenuChangeIsOpenEvent,
	MenuBarSubMenuArrowRightEvent,
	MenuBarSubMenuArrowLeftEvent
} from './menubarview.js';
import type { FocusableView } from '../focuscycler.js';
import type { ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';
import type { ButtonExecuteEvent } from '../button/button.js';

export const EVENT_NAME_DELEGATES = [ 'mouseenter', 'arrowleft', 'arrowright', 'menuButtonFocus', 'change:isOpen' ] as const;

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
		menuBarView.on<MenuBarSubMenuMouseEnterEvent>( 'submenu:mouseenter', evt => {
			// This works only when the menu bar has already been open and the user hover over the menu bar.
			if ( !menuBarView.isOpen ) {
				return;
			}

			for ( const menuView of menuBarView.menus ) {
				const wasOpen = menuView.isOpen;
				menuView.isOpen = evt.path.includes( menuView );

				if ( wasOpen !== menuView.isOpen ) {
					console.log( '[BEHAVIOR] toggleMenusAndFocusItemsOnHover(): Toggle', logMenu( menuView ), 'isOpen', menuView.isOpen );
				}
			}

			( evt.source as FocusableView ).focus();
		} );
	},

	focusCycleMenusOnArrows( menuBarView: MenuBarView ): void {
		menuBarView.on<MenuBarSubMenuArrowRightEvent>( 'submenu:arrowright', evt => {
			cycleTopLevelMenus( evt.source as MenuBarMenuView, 1 );
		} );

		menuBarView.on<MenuBarSubMenuArrowLeftEvent>( 'submenu:arrowleft', evt => {
			cycleTopLevelMenus( evt.source as MenuBarMenuView, -1 );
		} );

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

	closeMenusWhenTheBarCloses( menuBarView: MenuBarView ): void {
		menuBarView.on<ObservableChangeEvent<boolean>>( 'change:isOpen', () => {
			if ( !menuBarView.isOpen ) {
				menuBarView.menus.forEach( menuView => {
					menuView.isOpen = false;

					console.log( '[BEHAVIOR] closeMenusWhenTheBarCloses(): Closing', logMenu( menuView ) );
				} );
			}
		} );
	},

	closeMenuWhenAnotherOnTheSameLevelOpens( menuBarView: MenuBarView ): void {
		menuBarView.on<MenuBarSubMenuChangeIsOpenEvent>( 'submenu:change:isOpen', ( evt, name, isOpen ) => {
			if ( isOpen ) {
				menuBarView.menus
					.filter( menuView => {
						return ( evt.source as any ).parentMenuView === menuView.parentMenuView &&
							evt.source !== menuView &&
							menuView.isOpen;
					} ).forEach( menuView => {
						menuView.isOpen = false;

						console.log( '[BEHAVIOR] closeMenuWhenAnotherOpens(): Closing', logMenu( menuView ) );
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
				console.log( '[BEHAVIOR] openOnArrowRightKey(): Opening', logMenu( menuView ) );
				menuView.isOpen = true;
				menuView.panelView.focus();
				cancel();
			}
		} );
	},

	openOnButtonClick( menuView: MenuBarMenuView ): void {
		menuView.buttonView.on<ButtonExecuteEvent>( 'execute', () => {
			menuView.isOpen = true;

			menuView.panelView.focus();
		} );
	},

	toggleOnButtonClick( menuView: MenuBarMenuView ): void {
		menuView.buttonView.on<ButtonExecuteEvent>( 'execute', () => {
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
		menuView.buttonView.on<ButtonExecuteEvent>( 'execute', evt => {
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
		menuView.parentMenuView!.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
			if ( !isOpen && evt.source === menuView.parentMenuView ) {
				console.log( '[BEHAVIOR] closeOnParentClose(): Closing', logMenu( menuView ) );
				menuView.isOpen = false;
			}
		} );
	}
};

function logMenu( menuView: MenuBarMenuView ) {
	return `"${ menuView.buttonView.label }"`;
}
