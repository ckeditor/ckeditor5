/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menu/utils
 */

import type { UIViewRenderEvent } from '../view.js';
import clickOutsideHandler from '../bindings/clickoutsidehandler.js';
import type { ButtonExecuteEvent } from '../button/button.js';
import SwitchButtonView from '../button/switchbuttonview.js';
import type MenuWithButtonView from './menuwithbuttonview.js';
import { global, type PositioningFunction, type ObservableChangeEvent } from '@ckeditor/ckeditor5-utils';

export const MenuWithButtonBehaviors = {
	toggleOnButtonClick( menuWithButtonView: MenuWithButtonView ): void {
		menuWithButtonView.listenTo<ButtonExecuteEvent>( menuWithButtonView.buttonView, 'execute', () => {
			menuWithButtonView.isOpen = !menuWithButtonView.isOpen;
		} );
	},

	openAndFocusMenuOnArrowDownKey( menuWithButtonView: MenuWithButtonView ): void {
		menuWithButtonView.keystrokes.set( 'arrowdown', ( data, cancel ) => {
			if ( menuWithButtonView.isEnabled && !menuWithButtonView.isOpen ) {
				menuWithButtonView.isOpen = true;

				menuWithButtonView.menuView.focus();
				cancel();
			}
		} );
	},

	closeOnArrowLeftKey( menuWithButtonView: MenuWithButtonView ): void {
		menuWithButtonView.keystrokes.set( 'arrowleft', ( evt, cancel ) => {
			if ( menuWithButtonView.isOpen ) {
				menuWithButtonView.isOpen = false;
				menuWithButtonView.focus();
				cancel();
			}
		} );
	},

	closeOnEscKey( menuWithButtonView: MenuWithButtonView ): void {
		menuWithButtonView.keystrokes.set( 'esc', ( evt, cancel ) => {
			if ( menuWithButtonView.isOpen ) {
				menuWithButtonView.isOpen = false;
				menuWithButtonView.buttonView.focus();
				cancel();
			}
		} );
	},

	blockArrowRightKey( menuWithButtonView: MenuWithButtonView ): void {
		menuWithButtonView.keystrokes.set( 'arrowright', ( data, cancel ) => {
			if ( menuWithButtonView.isOpen ) {
				cancel();
			}
		} );
	},

	closeOnClickOutside( menuWithButtonView: MenuWithButtonView ): void {
		menuWithButtonView.on<UIViewRenderEvent>( 'render', () => {
			clickOutsideHandler( {
				emitter: menuWithButtonView,
				activator: () => menuWithButtonView.isOpen,
				callback: () => {
					menuWithButtonView.isOpen = false;
				},
				contextElements: () => [
					menuWithButtonView.element!,
					...( menuWithButtonView.focusTracker._elements as Set<HTMLElement> )
				]
			} );
		} );
	},

	closeOnMenuChildrenExecute( menuWithButtonView: MenuWithButtonView ): void {
		// Close the dropdown when one of the list items has been executed.
		menuWithButtonView.on<ButtonExecuteEvent>( 'execute', evt => {
			// Toggling a switch button view should not close the dropdown.
			if ( evt.source instanceof SwitchButtonView ) {
				return;
			}

			menuWithButtonView.isOpen = false;
		} );
	},

	closeOnBlur( menuWithButtonView: MenuWithButtonView ): void {
		menuWithButtonView.focusTracker.on<ObservableChangeEvent<boolean>>( 'change:isFocused', ( evt, name, isFocused ) => {
			if ( menuWithButtonView.isOpen && !isFocused ) {
				menuWithButtonView.isOpen = false;
			}
		} );
	},

	focusMenuContentsOnArrows( menuWithButtonView: MenuWithButtonView ): void {
		// If the dropdown panel is already open, the arrow down key should focus the first child of the #panelView.
		menuWithButtonView.keystrokes.set( 'arrowdown', ( data, cancel ) => {
			if ( menuWithButtonView.isOpen ) {
				menuWithButtonView.menuView.focus( 1 );
				cancel();
			}
		} );

		// If the dropdown panel is already open, the arrow up key should focus the last child of the #panelView.
		menuWithButtonView.keystrokes.set( 'arrowup', ( data, cancel ) => {
			if ( menuWithButtonView.isOpen ) {
				menuWithButtonView.menuView.focus( -1 );
				cancel();
			}
		} );
	},

	focusMenuButtonOnClose( menuWithButtonView: MenuWithButtonView ): void {
		menuWithButtonView.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
			if ( isOpen ) {
				return;
			}

			const element = menuWithButtonView.menuView.element;

			// If the dropdown was closed, move the focus back to the button (#12125).
			// Don't touch the focus, if it moved somewhere else (e.g. moved to the editing root on #execute) (#12178).
			// Note: Don't use the state of the DropdownMenuView#focusTracker here. It fires #blur with the timeout.
			if ( element && element.contains( global.document.activeElement ) ) {
				menuWithButtonView.buttonView.focus();
			}
		} );
	},

	focusMenuOnOpen( menuWithButtonView: MenuWithButtonView ): void {
		menuWithButtonView.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
			if ( !isOpen ) {
				return;
			}

			// Focus the first item in the dropdown when the dropdown opened.
			menuWithButtonView.menuView.focus();

			// * Let the panel show up first (do not focus an invisible element).
			// * Also, execute before focusChildOnDropdownOpen() to make sure this helper does not break the
			//   focus of a specific child by kicking in too late and resetting the focus in the panel.
		}, { priority: 'low' } );
	}
};

export const DropdownMenuPositions: Record<string, PositioningFunction> = {
	south: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.bottom,
			left: buttonRect.left - ( panelRect.width - buttonRect.width ) / 2,
			name: 's'
		};
	},
	southEast: buttonRect => {
		return {
			top: buttonRect.bottom,
			left: buttonRect.left,
			name: 'se'
		};
	},
	southWest: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.bottom,
			left: buttonRect.left - panelRect.width + buttonRect.width,
			name: 'sw'
		};
	},
	southMiddleEast: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.bottom,
			left: buttonRect.left - ( panelRect.width - buttonRect.width ) / 4,
			name: 'sme'
		};
	},
	southMiddleWest: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.bottom,
			left: buttonRect.left - ( panelRect.width - buttonRect.width ) * 3 / 4,
			name: 'smw'
		};
	},
	north: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.left - ( panelRect.width - buttonRect.width ) / 2,
			name: 'n'
		};
	},
	northEast: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.left,
			name: 'ne'
		};
	},
	northWest: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.left - panelRect.width + buttonRect.width,
			name: 'nw'
		};
	},
	northMiddleEast: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.left - ( panelRect.width - buttonRect.width ) / 4,
			name: 'nme'
		};
	},
	northMiddleWest: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.left - ( panelRect.width - buttonRect.width ) * 3 / 4,
			name: 'nmw'
		};
	}
};
