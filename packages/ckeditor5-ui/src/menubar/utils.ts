/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menubar/utils
 */

import clickOutsideHandler from '../bindings/clickoutsidehandler.js';
import type MenuBarMenuItemView from './menubarmenuitemview.js';
import MenuBarMenuView from './menubarmenuview.js';
import type MenuBarView from './menubarview.js';
import type MenuBarButtonView from './menubarbuttonview.js';

import { focusDropdownPanelOnOpen, openDropdownOnArrowDownKey } from '../dropdown/utils.js';

export const MenuBarBehaviors = {
	closeOnClickOutside( menuBarView: MenuBarView ): void {
		clickOutsideHandler( {
			emitter: menuBarView,
			activator: () => menuBarView.isOpen,
			callback: () => menuBarView.close(),
			contextElements: menuBarView.children.map( child => child.element! )
		} );
	}
};

export const MenuBarMenuBehaviors = {
	focusPanelOnOpen: focusDropdownPanelOnOpen,

	/**
	 * Pressing esc should keep focus on the menu button to allow further keyboard navigation.
	 */
	focusMenuOnEscKeyPress( menuView: MenuBarMenuView ): void {
		menuView.on( 'keydown', ( evt, data ) => {
			if ( data.keystroke === 'Esc' ) {
				menuView.focus();
			}
		} );
	},

	focusButtonOnHover( menuBarView: MenuBarView, menuButtonView: MenuBarButtonView ): void {
		menuButtonView.on( 'mouseenter', () => {
			if ( !menuBarView.isOpen ) {
				return;
			}

			menuButtonView.focus();
		} );
	},

	focusPanelOnArrowDownKey( menuView: MenuBarMenuView ): void {
		menuView.keystrokes.set( 'arrowdown', ( data, cancel ) => {
			if ( menuView.isOpen && menuView.focusTracker.focusedElement === menuView.buttonView.element ) {
				menuView.panelView.focus();
				cancel();
			}
		} );
	},

	/**
	 * Allow opening the top-level menu using the arrow down key.
	 */
	openOnArrowDownKey: openDropdownOnArrowDownKey,

	/**
	 * Allow navigating to sub-menus using the arrow right key.
	 */
	openOnArrowRightKey( menuBarView: MenuBarView, menuView: MenuBarMenuView ): void {
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

	openOnButtonFocus( menuBarView: MenuBarView, menuView: MenuBarMenuView ): void {
		menuView.focusTracker.on( 'change:focusedElement', () => {
			// Only during hover-navigation.
			if ( menuBarView.isOpen ) {
				if ( menuView.focusTracker.focusedElement === menuView.buttonView.element ) {
					menuView.isOpen = true;
				}
			}
		} );
	},

	openOrCloseOnHover( menuBarView: MenuBarView, menuView: MenuBarMenuView ): void {
		menuBarView.on( 'mouseenter:submenu', ( evt, { source } ) => {
			if ( !menuBarView.isOpen ) {
				return;
			}

			const eventPath = getMenuEventPath( source );

			if ( source === menuView ) {
				menuView.isOpen = true;
			} else if ( !eventPath.includes( menuView ) ) {
				menuView.isOpen = false;
			}
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
		menuView.buttonView.on( 'open', ( evt, data ) => {
			if ( menuView.isOpen ) {
				evt.stop();
			}

			data.method = 'buttonClick';
		}, { priority: 'high' } );
	},

	closeOnExternalItemHover( menuBarView: MenuBarView, menuView: MenuBarMenuView ): void {
		menuBarView.on( 'mouseenter:item', ( evt, { source } ) => {
			const eventPath = getMenuEventPath( source );

			if ( !eventPath.includes( menuView ) ) {
				menuView.isOpen = false;
			}
		} );
	},

	closeOnArrowLeftKey( menuBarView: MenuBarView, menuView: MenuBarMenuView ): void {
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
		} );
	},

	closeOnMenuBarClose( menuBarView: MenuBarView, menuView: MenuBarMenuView ): void {
		menuBarView.on( 'change:isOpen', () => {
			if ( !menuBarView.isOpen ) {
				menuView.isOpen = false;
			}
		} );
	},

	closeOnParentClose( menuView: MenuBarMenuView ): void {
		menuView.parentMenuView!.on( 'change:isOpen', ( evt, name, isOpen ) => {
			if ( !isOpen ) {
				menuView.isOpen = false;
			}
		} );
	},

	navigateToNextOnArrowRightKey( menuBarView: MenuBarView, menuView: MenuBarMenuView ): void {
		menuView.keystrokes.set( 'arrowright', ( data, cancel ) => {
			menuBarView.fire( 'cycleForward', { currentMenuView: menuView } );
			cancel();
		} );
	},

	navigateToPreviousOnArrowLeftKey( menuBarView: MenuBarView, menuView: MenuBarMenuView ): void {
		menuView.keystrokes.set( 'arrowleft', ( data, cancel ) => {
			menuBarView.fire( 'cycleBackward', { currentMenuView: menuView } );
			cancel();
		} );
	}
};

function getMenuEventPath( source: MenuBarMenuView | MenuBarMenuItemView ) {
	const path = [];

	if ( source instanceof MenuBarMenuView ) {
		path.push( source );
	}

	let parentMenuView = source.parentMenuView;

	while ( parentMenuView ) {
		path.push( parentMenuView );
		parentMenuView = parentMenuView.parentMenuView;
	}

	return path;
}
