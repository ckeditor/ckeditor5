/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menubar/utils
 */

import MenuBarMenuListItemView from './menubarmenulistitemview.js';
import type MenuBarMenuView from './menubarmenuview.js';
import type {
	default as MenuBarView,
	MenuBarConfig,
	MenuBarMenuMouseEnterEvent,
	MenuBarMenuChangeIsOpenEvent,
	MenuBarMenuArrowRightEvent,
	MenuBarMenuArrowLeftEvent,
	MenuBarMenuDefinition,
	MenuBarConfigObject,
	MenuBarConfigAddedGroup,
	MenuBarConfigAddedMenu,
	MenuBarConfigAddedPosition,
	NormalizedMenuBarConfigObject
} from './menubarview.js';
import clickOutsideHandler from '../bindings/clickoutsidehandler.js';
import type { ButtonExecuteEvent } from '../button/button.js';
import type ComponentFactory from '../componentfactory.js';
import type { FocusableView } from '../focuscycler.js';
import type { Editor } from '@ckeditor/ckeditor5-core';
import {
	logWarning,
	type Locale,
	type ObservableChangeEvent,
	type PositioningFunction
} from '@ckeditor/ckeditor5-utils';
import { cloneDeep } from 'lodash-es';

const NESTED_PANEL_HORIZONTAL_OFFSET = 5;

type DeepReadonly<T> = Readonly<{
	[K in keyof T]:
		T[K] extends string ? Readonly<T[K]>
			: T[K] extends Array<infer A> ? Readonly<Array<DeepReadonly<A>>>
				: DeepReadonly<T[K]>;
}>;

/**
 * Behaviors of the {@link module:ui/menubar/menubarview~MenuBarView} component.
 */
export const MenuBarBehaviors = {
	/**
	 * When the bar is already open:
	 * * Opens the menu when the user hovers over its button.
	 * * Closes open menu when another menu's button gets hovered.
	 */
	toggleMenusAndFocusItemsOnHover( menuBarView: MenuBarView ): void {
		menuBarView.on<MenuBarMenuMouseEnterEvent>( 'menu:mouseenter', evt => {
			// This works only when the menu bar has already been open and the user hover over the menu bar.
			if ( !menuBarView.isOpen ) {
				return;
			}

			for ( const menuView of menuBarView.menus ) {
				// @if CK_DEBUG_MENU_BAR // const wasOpen = menuView.isOpen;

				const pathLeaf = evt.path[ 0 ];
				const isListItemContainingMenu = pathLeaf instanceof MenuBarMenuListItemView && pathLeaf.children.first === menuView;

				menuView.isOpen = ( evt.path.includes( menuView ) || isListItemContainingMenu ) && menuView.isEnabled;

				// @if CK_DEBUG_MENU_BAR // if ( wasOpen !== menuView.isOpen ) {
				// @if CK_DEBUG_MENU_BAR // console.log( '[BEHAVIOR] toggleMenusAndFocusItemsOnHover(): Toggle',
				// @if CK_DEBUG_MENU_BAR // 	logMenu( menuView ), 'isOpen', menuView.isOpen
				// @if CK_DEBUG_MENU_BAR // );
				// @if CK_DEBUG_MENU_BAR // }
			}

			( evt.source as FocusableView ).focus();
		} );
	},

	/**
	 * Moves between top-level menus using the arrow left and right keys.
	 *
	 * If the menubar has already been open, the arrow keys move focus between top-level menu buttons and open them.
	 * If the menubar is closed, the arrow keys only move focus between top-level menu buttons.
	 */
	focusCycleMenusOnArrows( menuBarView: MenuBarView ): void {
		const isContentRTL = menuBarView.locale!.uiLanguageDirection === 'rtl';

		menuBarView.on<MenuBarMenuArrowRightEvent>( 'menu:arrowright', evt => {
			cycleTopLevelMenus( evt.source as MenuBarMenuView, isContentRTL ? -1 : 1 );
		} );

		menuBarView.on<MenuBarMenuArrowLeftEvent>( 'menu:arrowleft', evt => {
			cycleTopLevelMenus( evt.source as MenuBarMenuView, isContentRTL ? 1 : -1 );
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

	/**
	 * Closes the entire sub-menu structure when the bar is closed. This prevents sub-menus from being open if the user
	 * closes the entire bar, and then re-opens some top-level menu.
	 */
	closeMenusWhenTheBarCloses( menuBarView: MenuBarView ): void {
		menuBarView.on<ObservableChangeEvent<boolean>>( 'change:isOpen', () => {
			if ( !menuBarView.isOpen ) {
				menuBarView.menus.forEach( menuView => {
					menuView.isOpen = false;

					// @if CK_DEBUG_MENU_BAR // console.log( '[BEHAVIOR] closeMenusWhenTheBarCloses(): Closing', logMenu( menuView ) );
				} );
			}
		} );
	},

	/**
	 * Handles the following case:
	 * 1. Hover to open a sub-menu (A). The button has focus.
	 * 2. Press arrow up/down to move focus to another sub-menu (B) button.
	 * 3. Press arrow right to open the sub-menu (B).
	 * 4. The sub-menu (A) should close as it would with `toggleMenusAndFocusItemsOnHover()`.
	 */
	closeMenuWhenAnotherOnTheSameLevelOpens( menuBarView: MenuBarView ): void {
		menuBarView.on<MenuBarMenuChangeIsOpenEvent>( 'menu:change:isOpen', ( evt, name, isOpen ) => {
			if ( isOpen ) {
				menuBarView.menus
					.filter( menuView => {
						return ( evt.source as any ).parentMenuView === menuView.parentMenuView &&
							evt.source !== menuView &&
							menuView.isOpen;
					} ).forEach( menuView => {
						menuView.isOpen = false;

						// @if CK_DEBUG_MENU_BAR // console.log( '[BEHAVIOR] closeMenuWhenAnotherOpens(): Closing', logMenu( menuView ) );
					} );
			}
		} );
	},

	/**
	 * Closes the bar when the user clicked outside of it (page body, editor root, etc.).
	 */
	closeOnClickOutside( menuBarView: MenuBarView ): void {
		clickOutsideHandler( {
			emitter: menuBarView,
			activator: () => menuBarView.isOpen,
			callback: () => menuBarView.close(),
			contextElements: () => menuBarView.children.map( child => child.element! )
		} );
	}
};

/**
 * Behaviors of the {@link module:ui/menubar/menubarmenuview~MenuBarMenuView} component.
 */
export const MenuBarMenuBehaviors = {
	/**
	 * If the button of the menu is focused, pressing the arrow down key should open the panel and focus it.
	 * This is analogous to the {@link module:ui/dropdown/dropdownview~DropdownView}.
	 */
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
	 * Open the menu on the right arrow key press. This allows for navigating to sub-menus using the keyboard.
	 */
	openOnArrowRightKey( menuView: MenuBarMenuView ): void {
		const keystroke = menuView.locale!.uiLanguageDirection === 'rtl' ? 'arrowleft' : 'arrowright';

		menuView.keystrokes.set( keystroke, ( data, cancel ) => {
			if ( menuView.focusTracker.focusedElement !== menuView.buttonView.element || !menuView.isEnabled ) {
				return;
			}

			// @if CK_DEBUG_MENU_BAR // console.log( '[BEHAVIOR] openOnArrowRightKey(): Opening', logMenu( menuView ) );

			if ( !menuView.isOpen ) {
				menuView.isOpen = true;
			}

			menuView.panelView.focus();
			cancel();
		} );
	},

	/**
	 * Opens the menu on its button click. Note that this behavior only opens but never closes the menu (unlike
	 * {@link module:ui/dropdown/dropdownview~DropdownView}).
	 */
	openOnButtonClick( menuView: MenuBarMenuView ): void {
		menuView.buttonView.on<ButtonExecuteEvent>( 'execute', () => {
			menuView.isOpen = true;
			menuView.panelView.focus();
		} );
	},

	/**
	 * Toggles the menu on its button click. This behavior is analogous to {@link module:ui/dropdown/dropdownview~DropdownView}.
	 */
	toggleOnButtonClick( menuView: MenuBarMenuView ): void {
		menuView.buttonView.on<ButtonExecuteEvent>( 'execute', () => {
			menuView.isOpen = !menuView.isOpen;

			if ( menuView.isOpen ) {
				menuView.panelView.focus();
			}
		} );
	},

	/**
	 * Closes the menu on the right left key press. This allows for navigating to sub-menus using the keyboard.
	 */
	closeOnArrowLeftKey( menuView: MenuBarMenuView ): void {
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
	 * Closes the menu on the esc key press. This allows for navigating to sub-menus using the keyboard.
	 */
	closeOnEscKey( menuView: MenuBarMenuView ): void {
		menuView.keystrokes.set( 'esc', ( data, cancel ) => {
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
	closeOnParentClose( menuView: MenuBarMenuView ): void {
		menuView.parentMenuView!.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
			if ( !isOpen && evt.source === menuView.parentMenuView ) {
				// @if CK_DEBUG_MENU_BAR // console.log( '[BEHAVIOR] closeOnParentClose(): Closing', logMenu( menuView ) );

				menuView.isOpen = false;
			}
		} );
	}
};

// @if CK_DEBUG_MENU_BAR // function logMenu( menuView: MenuBarMenuView ) {
// @if CK_DEBUG_MENU_BAR //	return `"${ menuView.buttonView.label }"`;
// @if CK_DEBUG_MENU_BAR // }

/**
 * Contains every positioning function used by {@link module:ui/menubar/menubarmenuview~MenuBarMenuView} that decides where the
 * {@link module:ui/menubar/menubarmenuview~MenuBarMenuView#panelView} should be placed.
 *
 * Top-level menu positioning functions:
 *
 *	┌──────┐
 *	│      │
 *	├──────┴────────┐
 *	│               │
 *	│               │
 *	│               │
 *	│            SE │
 *	└───────────────┘
 *
 *	         ┌──────┐
 *	         │      │
 *	┌────────┴──────┤
 *	│               │
 *	│               │
 *	│               │
 *	│ SW            │
 *	└───────────────┘
 *
 *	┌───────────────┐
 *	│ NW            │
 *	│               │
 *	│               │
 *	│               │
 *	└────────┬──────┤
 *	         │      │
 *	         └──────┘
 *
 *	┌───────────────┐
 *	│            NE │
 *	│               │
 *	│               │
 *	│               │
 *	├──────┬────────┘
 *	│      │
 *	└──────┘
 *
 * Sub-menu positioning functions:
 *
 *	┌──────┬───────────────┐
 *	│      │               │
 *	└──────┤               │
 *	       │               │
 *	       │            ES │
 *	       └───────────────┘
 *
 *	┌───────────────┬──────┐
 *	│               │      │
 *	│               ├──────┘
 *	│               │
 *	│ WS            │
 *	└───────────────┘
 *
 *	       ┌───────────────┐
 *	       │            EN │
 *	       │               │
 *	┌──────┤               │
 *	│      │               │
 *	└──────┴───────────────┘
 *
 *	┌───────────────┐
 *	│ WN            │
 *	│               │
 *	│               ├──────┐
 *	│               │      │
 *	└───────────────┴──────┘
 */
export const MenuBarMenuViewPanelPositioningFunctions: Record<string, PositioningFunction> = {
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
	eastSouth: buttonRect => {
		return {
			top: buttonRect.top,
			left: buttonRect.right - NESTED_PANEL_HORIZONTAL_OFFSET,
			name: 'es'
		};
	},
	eastNorth: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.right - NESTED_PANEL_HORIZONTAL_OFFSET,
			name: 'en'
		};
	},
	westSouth: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top,
			left: buttonRect.left - panelRect.width + NESTED_PANEL_HORIZONTAL_OFFSET,
			name: 'ws'
		};
	},
	westNorth: ( buttonRect, panelRect ) => {
		return {
			top: buttonRect.top - panelRect.height,
			left: buttonRect.left - panelRect.width + NESTED_PANEL_HORIZONTAL_OFFSET,
			name: 'wn'
		};
	}
} as const;

/**
 * The default items {@link module:core/editor/editorconfig~EditorConfig#menuBar configuration} of the
 * {@link module:ui/menubar/menubarview~MenuBarView} component. It contains names of all menu bar components
 * registered in the {@link module:ui/componentfactory~ComponentFactory component factory} (available in the project).
 *
 * **Note**: Menu bar component names provided by core editor features are prefixed with `menuBar:` in order to distinguish
 * them from components referenced by the {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar configuration}, for instance,
 * `'menuBar:bold'` is a menu bar button but `'bold'` is a toolbar button.
 *
 * Below is the preset menu bar structure (the default value of `config.menuBar.items` property):
 *
 * ```ts
 * [
 * 	{
 * 		menuId: 'file',
 * 		label: 'File',
 * 		groups: [
 * 			{
 * 				groupId: 'export',
 * 				items: [
 * 					'menuBar:exportPdf',
 * 					'menuBar:exportWord'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'import',
 * 				items: [
 * 					'menuBar:importWord'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'revisionHistory',
 * 				items: [
 * 					'menuBar:revisionHistory'
 * 				]
 * 			}
 * 		]
 * 	},
 * 	{
 * 		menuId: 'edit',
 * 		label: 'Edit',
 * 		groups: [
 * 			{
 * 				groupId: 'undo',
 * 				items: [
 * 					'menuBar:undo',
 * 					'menuBar:redo'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'selectAll',
 * 				items: [
 * 					'menuBar:selectAll'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'findAndReplace',
 * 				items: [
 * 					'menuBar:findAndReplace'
 * 				]
 * 			}
 * 		]
 * 	},
 * 	{
 * 		menuId: 'view',
 * 		label: 'View',
 * 		groups: [
 * 			{
 * 				groupId: 'sourceEditing',
 * 				items: [
 * 					'menuBar:sourceEditing'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'showBlocks',
 * 				items: [
 * 					'menuBar:showBlocks'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'restrictedEditingException',
 * 				items: [
 * 					'menuBar:restrictedEditingException'
 * 				]
 * 			}
 * 		]
 * 	},
 * 	{
 * 		menuId: 'insert',
 * 		label: 'Insert',
 * 		groups: [
 * 			{
 * 				groupId: 'insertMainWidgets',
 * 				items: [
 * 					'menuBar:insertImage',
 * 					'menuBar:ckbox',
 * 					'menuBar:ckfinder',
 * 					'menuBar:insertTable'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'insertInline',
 * 				items: [
 * 					'menuBar:link',
 * 					'menuBar:comment'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'insertMinorWidgets',
 * 				items: [
 * 					'menuBar:mediaEmbed',
 * 					'menuBar:insertTemplate',
 * 					'menuBar:blockQuote',
 * 					'menuBar:codeBlock',
 * 					'menuBar:htmlEmbed'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'insertStructureWidgets',
 * 				items: [
 * 					'menuBar:horizontalLine',
 * 					'menuBar:pageBreak',
 * 					'menuBar:tableOfContents'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'restrictedEditing',
 * 				items: [
 * 					'menuBar:restrictedEditing'
 * 				]
 * 			}
 * 		]
 * 	},
 * 	{
 * 		menuId: 'format',
 * 		label: 'Format',
 * 		groups: [
 * 			{
 * 				groupId: 'textAndFont',
 * 				items: [
 * 					{
 * 						menuId: 'text',
 * 						label: 'Text',
 * 						groups: [
 * 							{
 * 								groupId: 'basicStyles',
 * 								items: [
 * 									'menuBar:bold',
 * 									'menuBar:italic',
 * 									'menuBar:underline',
 * 									'menuBar:strikethrough',
 * 									'menuBar:superscript',
 * 									'menuBar:subscript',
 * 									'menuBar:code'
 * 								]
 * 							},
 * 							{
 * 								groupId: 'textPartLanguage',
 * 								items: [
 * 									'menuBar:textPartLanguage'
 * 								]
 * 							}
 * 						]
 * 					},
 * 					{
 * 						menuId: 'font',
 * 						label: 'Font',
 * 						groups: [
 * 							{
 * 								groupId: 'fontProperties',
 * 								items: [
 * 									'menuBar:fontSize',
 * 									'menuBar:fontFamily'
 * 								]
 * 							},
 * 							{
 * 								groupId: 'fontColors',
 * 								items: [
 * 									'menuBar:fontColor',
 * 									'menuBar:fontBackgroundColor'
 * 								]
 * 							},
 * 							{
 * 								groupId: 'highlight',
 * 								items: [
 * 									'menuBar:highlight'
 * 								]
 * 							}
 * 						]
 * 					},
 * 					'menuBar:heading'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'list',
 * 				items: [
 * 					'menuBar:bulletedList',
 * 					'menuBar:numberedList',
 * 					'menuBar:multiLevelList',
 * 					'menuBar:todoList'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'indent',
 * 				items: [
 * 					'menuBar:alignment',
 * 					'menuBar:indent',
 * 					'menuBar:outdent'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'caseChange',
 * 				items: [
 * 					'menuBar:caseChange'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'removeFormat',
 * 				items: [
 * 					'menuBar:removeFormat'
 * 				]
 * 			}
 * 		]
 * 	},
 * 	{
 * 		menuId: 'tools',
 * 		label: 'Tools',
 * 		groups: [
 * 			{
 * 				groupId: 'aiTools',
 * 				items: [
 * 					'menuBar:aiAssistant',
 * 					'menuBar:aiCommands'
 * 				]
 * 			},
 * 			{
 * 				groupId: 'tools',
 * 				items: [
 * 					'menuBar:trackChanges',
 * 					'menuBar:commentsArchive'
 * 				]
 * 			}
 * 		]
 * 	},
 * 	{
 * 		menuId: 'help',
 * 		label: 'Help',
 * 		groups: [
 * 			{
 * 				groupId: 'help',
 * 				items: [
 * 					'menuBar:accessibilityHelp'
 * 				]
 * 			}
 * 		]
 * 	}
 * ];
 * ```
 *
 * The menu bar can be customized using the `config.menuBar.removeItems` and `config.menuBar.addItems` properties.
 */
// **NOTE: Whenever you make changes to this value, reflect it in the documentation above!**
export const DefaultMenuBarItems: DeepReadonly<MenuBarConfigObject[ 'items' ]> = [
	{
		menuId: 'file',
		label: 'File',
		groups: [
			{
				groupId: 'export',
				items: [
					'menuBar:exportPdf',
					'menuBar:exportWord'
				]
			},
			{
				groupId: 'import',
				items: [
					'menuBar:importWord'
				]
			},
			{
				groupId: 'revisionHistory',
				items: [
					'menuBar:revisionHistory'
				]
			}
		]
	},
	{
		menuId: 'edit',
		label: 'Edit',
		groups: [
			{
				groupId: 'undo',
				items: [
					'menuBar:undo',
					'menuBar:redo'
				]
			},
			{
				groupId: 'selectAll',
				items: [
					'menuBar:selectAll'
				]
			},
			{
				groupId: 'findAndReplace',
				items: [
					'menuBar:findAndReplace'
				]
			}
		]
	},
	{
		menuId: 'view',
		label: 'View',
		groups: [
			{
				groupId: 'sourceEditing',
				items: [
					'menuBar:sourceEditing'
				]
			},
			{
				groupId: 'showBlocks',
				items: [
					'menuBar:showBlocks'
				]
			},
			{
				groupId: 'restrictedEditingException',
				items: [
					'menuBar:restrictedEditingException'
				]
			}
		]
	},
	{
		menuId: 'insert',
		label: 'Insert',
		groups: [
			{
				groupId: 'insertMainWidgets',
				items: [
					'menuBar:insertImage',
					'menuBar:ckbox',
					'menuBar:ckfinder',
					'menuBar:insertTable'
				]
			},
			{
				groupId: 'insertInline',
				items: [
					'menuBar:link',
					'menuBar:comment'
				]
			},
			{
				groupId: 'insertMinorWidgets',
				items: [
					'menuBar:mediaEmbed',
					'menuBar:insertTemplate',
					'menuBar:specialCharacters',
					'menuBar:blockQuote',
					'menuBar:codeBlock',
					'menuBar:htmlEmbed'
				]
			},
			{
				groupId: 'insertStructureWidgets',
				items: [
					'menuBar:horizontalLine',
					'menuBar:pageBreak',
					'menuBar:tableOfContents'
				]
			},
			{
				groupId: 'restrictedEditing',
				items: [
					'menuBar:restrictedEditing'
				]
			}
		]
	},
	{
		menuId: 'format',
		label: 'Format',
		groups: [
			{
				groupId: 'textAndFont',
				items: [
					{
						menuId: 'text',
						label: 'Text',
						groups: [
							{
								groupId: 'basicStyles',
								items: [
									'menuBar:bold',
									'menuBar:italic',
									'menuBar:underline',
									'menuBar:strikethrough',
									'menuBar:superscript',
									'menuBar:subscript',
									'menuBar:code'
								]
							},
							{
								groupId: 'textPartLanguage',
								items: [
									'menuBar:textPartLanguage'
								]
							}
						]
					},
					{
						menuId: 'font',
						label: 'Font',
						groups: [
							{
								groupId: 'fontProperties',
								items: [
									'menuBar:fontSize',
									'menuBar:fontFamily'
								]
							},
							{
								groupId: 'fontColors',
								items: [
									'menuBar:fontColor',
									'menuBar:fontBackgroundColor'
								]
							},
							{
								groupId: 'highlight',
								items: [
									'menuBar:highlight'
								]
							}
						]
					},
					'menuBar:heading'
				]
			},
			{
				groupId: 'list',
				items: [
					'menuBar:bulletedList',
					'menuBar:numberedList',
					'menuBar:multiLevelList',
					'menuBar:todoList'
				]
			},
			{
				groupId: 'indent',
				items: [
					'menuBar:alignment',
					'menuBar:indent',
					'menuBar:outdent'
				]
			},
			{
				groupId: 'caseChange',
				items: [
					'menuBar:caseChange'
				]
			},
			{
				groupId: 'removeFormat',
				items: [
					'menuBar:removeFormat'
				]
			}
		]
	},
	{
		menuId: 'tools',
		label: 'Tools',
		groups: [
			{
				groupId: 'aiTools',
				items: [
					'menuBar:aiAssistant',
					'menuBar:aiCommands'
				]
			},
			{
				groupId: 'tools',
				items: [
					'menuBar:trackChanges',
					'menuBar:commentsArchive'
				]
			}
		]
	},
	{
		menuId: 'help',
		label: 'Help',
		groups: [
			{
				groupId: 'help',
				items: [
					'menuBar:accessibilityHelp'
				]
			}
		]
	}
];

/**
 * Performs a cleanup and normalization of the menu bar configuration.
 */
export function normalizeMenuBarConfig( config: Readonly<MenuBarConfig> ): NormalizedMenuBarConfigObject {
	let configObject: NormalizedMenuBarConfigObject;

	// The integrator specified the config as an object but without items. Let's give them defaults but respect their
	// additions and removals.
	if ( !( 'items' in config ) || !config.items ) {
		configObject = {
			items: cloneDeep( DefaultMenuBarItems ) as Array<MenuBarMenuDefinition>,
			addItems: [],
			removeItems: [],
			isVisible: true,
			isUsingDefaultConfig: true,
			...config
		};
	}
	// The integrator specified the config as an object and there are items there. Let's take it as it is.
	else {
		configObject = {
			items: config.items,
			removeItems: [],
			addItems: [],
			isVisible: true,
			isUsingDefaultConfig: false,
			...config
		};
	}

	return configObject;
}

/**
 * Processes a normalized menu bar config and returns a config clone with the following modifications:
 *
 * * Removed components that are not available in the component factory,
 * * Removed obsolete separators,
 * * Purged empty menus,
 * * Localized top-level menu labels.
 */
export function processMenuBarConfig( {
	normalizedConfig,
	locale,
	componentFactory
}: {
	normalizedConfig: NormalizedMenuBarConfigObject;
	locale: Locale;
	componentFactory: ComponentFactory;
} ): NormalizedMenuBarConfigObject {
	const configClone = cloneDeep( normalizedConfig ) as NormalizedMenuBarConfigObject;

	handleRemovals( normalizedConfig, configClone );
	handleAdditions( normalizedConfig, configClone );
	purgeUnavailableComponents( normalizedConfig, configClone, componentFactory );
	purgeEmptyMenus( normalizedConfig, configClone );
	localizeMenuLabels( configClone, locale );

	return configClone;
}

/**
 * Removes items from the menu bar config based on user `removeItems` configuration. Users can remove
 * individual items, groups, or entire menus. For each removed item, a warning is logged if the item
 * was not found in the configuration.
 */
function handleRemovals(
	originalConfig: NormalizedMenuBarConfigObject,
	config: NormalizedMenuBarConfigObject
) {
	const itemsToBeRemoved = config.removeItems;
	const successfullyRemovedItems: Array<string> = [];

	// Remove top-level menus.
	config.items = config.items.filter( ( { menuId } ) => {
		if ( itemsToBeRemoved.includes( menuId ) ) {
			successfullyRemovedItems.push( menuId );
			return false;
		}

		return true;
	} );

	walkConfigMenus( config.items, menuDefinition => {
		// Remove groups from menus.
		menuDefinition.groups = menuDefinition.groups.filter( ( { groupId } ) => {
			if ( itemsToBeRemoved.includes( groupId ) ) {
				successfullyRemovedItems.push( groupId );
				return false;
			}

			return true;
		} );

		// Remove sub-menus and items from groups.
		for ( const groupDefinition of menuDefinition.groups ) {
			groupDefinition.items = groupDefinition.items.filter( item => {
				const itemId = getIdFromGroupItem( item );

				if ( itemsToBeRemoved.includes( itemId ) ) {
					successfullyRemovedItems.push( itemId );
					return false;
				}

				return true;
			} );
		}
	} );

	for ( const itemName of itemsToBeRemoved ) {
		if ( !successfullyRemovedItems.includes( itemName ) ) {
			/**
			 * There was a problem processing the configuration of the menu bar. The item with the given
			 * name does could not be removed from the menu bar configuration.
			 *
			 * This warning usually shows up when the {@link module:core/plugin~Plugin} which is supposed
			 * to provide a menu bar item has not been loaded or there is a typo in the
			 * {@link module:core/editor/editorconfig~EditorConfig#menuBar menu bar configuration}.
			 *
			 * @error menu-bar-item-could-not-be-removed
			 * @param menuBarConfig The full configuration of the menu bar.
			 * @param itemName The name of the item that was not removed from the menu bar.
			 */
			logWarning( 'menu-bar-item-could-not-be-removed', {
				menuBarConfig: originalConfig,
				itemName
			} );
		}
	}
}

/**
 * Handles the `config.menuBar.addItems` configuration. It allows for adding menus, groups, and items at arbitrary
 * positions in the menu bar. If the position does not exist, a warning is logged.
 */
function handleAdditions(
	originalConfig: NormalizedMenuBarConfigObject,
	config: NormalizedMenuBarConfigObject
) {
	const itemsToBeAdded = config.addItems;
	const successFullyAddedItems: typeof itemsToBeAdded = [];

	for ( const itemToAdd of itemsToBeAdded ) {
		const relation = getRelationFromPosition( itemToAdd.position );
		const relativeId = getRelativeIdFromPosition( itemToAdd.position );

		// Adding a menu.
		if ( isMenuBarMenuAddition( itemToAdd ) ) {
			if ( !relativeId ) {
				// Adding a top-level menu at the beginning of the menu bar.
				if ( relation === 'start' ) {
					config.items.unshift( itemToAdd.menu );
					successFullyAddedItems.push( itemToAdd );
				}
				// Adding a top-level menu at the end of the menu bar.
				else if ( relation === 'end' ) {
					config.items.push( itemToAdd.menu );
					successFullyAddedItems.push( itemToAdd );
				}
			} else {
				const topLevelMenuDefinitionIndex = config.items.findIndex( menuDefinition => menuDefinition.menuId === relativeId );

				// Adding a top-level menu somewhere between existing menu bar menus.
				if ( topLevelMenuDefinitionIndex != -1 ) {
					if ( relation === 'before' ) {
						config.items.splice( topLevelMenuDefinitionIndex, 0, itemToAdd.menu );
						successFullyAddedItems.push( itemToAdd );
					} else if ( relation === 'after' ) {
						config.items.splice( topLevelMenuDefinitionIndex + 1, 0, itemToAdd.menu );
						successFullyAddedItems.push( itemToAdd );
					}
				}
				// Adding a sub-menu to an existing items group.
				else {
					const wasAdded = addMenuOrItemToGroup( config, itemToAdd.menu, relativeId, relation );

					if ( wasAdded ) {
						successFullyAddedItems.push( itemToAdd );
					}
				}
			}
		}
		// Adding a group.
		else if ( isMenuBarMenuGroupAddition( itemToAdd ) ) {
			walkConfigMenus( config.items, menuDefinition => {
				if ( menuDefinition.menuId === relativeId ) {
					// Add a group at the start of a menu.
					if ( relation === 'start' ) {
						menuDefinition.groups.unshift( itemToAdd.group );
						successFullyAddedItems.push( itemToAdd );
					}
					// Add a group at the end of a menu.
					else if ( relation === 'end' ) {
						menuDefinition.groups.push( itemToAdd.group );
						successFullyAddedItems.push( itemToAdd );
					}
				} else {
					const relativeGroupIndex = menuDefinition.groups.findIndex( group => group.groupId === relativeId );

					if ( relativeGroupIndex !== -1 ) {
						// Add a group before an existing group in a menu.
						if ( relation === 'before' ) {
							menuDefinition.groups.splice( relativeGroupIndex, 0, itemToAdd.group );
							successFullyAddedItems.push( itemToAdd );
						}
						// Add a group after an existing group in a menu.
						else if ( relation === 'after' ) {
							menuDefinition.groups.splice( relativeGroupIndex + 1, 0, itemToAdd.group );
							successFullyAddedItems.push( itemToAdd );
						}
					}
				}
			} );
		}
		// Adding an item to an existing items group.
		else {
			const wasAdded = addMenuOrItemToGroup( config, itemToAdd.item, relativeId, relation );

			if ( wasAdded ) {
				successFullyAddedItems.push( itemToAdd );
			}
		}
	}

	for ( const addedItemConfig of itemsToBeAdded ) {
		if ( !successFullyAddedItems.includes( addedItemConfig ) ) {
			/**
			 * There was a problem processing the configuration of the menu bar. The configured item could not be added
			 * because the position it was supposed to be added to does not exist.
			 *
			 * This warning usually shows up when the {@link module:core/plugin~Plugin} which is supposed
			 * to provide a menu bar item has not been loaded or there is a typo in the
			 * {@link module:core/editor/editorconfig~EditorConfig#menuBar menu bar configuration}.
			 *
			 * @error menu-bar-item-could-not-be-removed
			 * @param menuBarConfig The full configuration of the menu bar.
			 * @param itemName The name of the item that was not removed from the menu bar.
			 */
			logWarning( 'menu-bar-item-could-not-be-added', {
				menuBarConfig: originalConfig,
				addedItemConfig
			} );
		}
	}
}

/**
 * Handles adding a sub-menu or an item into a group. The logic is the same for both cases.
 */
function addMenuOrItemToGroup(
	config: NormalizedMenuBarConfigObject,
	itemOrMenuToAdd: string | MenuBarMenuDefinition,
	relativeId: string | null,
	relation: 'start' | 'end' | 'before' | 'after'
): boolean {
	let wasAdded = false;

	walkConfigMenus( config.items, menuDefinition => {
		for ( const { groupId, items: groupItems } of menuDefinition.groups ) {
			// Avoid infinite loops.
			if ( wasAdded ) {
				return;
			}

			if ( groupId === relativeId ) {
				// Adding an item/menu at the beginning of a group.
				if ( relation === 'start' ) {
					groupItems.unshift( itemOrMenuToAdd );
					wasAdded = true;
				}
				// Adding an item/menu at the end of a group.
				else if ( relation === 'end' ) {
					groupItems.push( itemOrMenuToAdd );
					wasAdded = true;
				}
			} else {
				// Adding an item/menu relative to an existing item/menu.
				const relativeItemIndex = groupItems.findIndex( groupItem => {
					return getIdFromGroupItem( groupItem ) === relativeId;
				} );

				if ( relativeItemIndex !== -1 ) {
					if ( relation === 'before' ) {
						groupItems.splice( relativeItemIndex, 0, itemOrMenuToAdd );
						wasAdded = true;
					} else if ( relation === 'after' ) {
						groupItems.splice( relativeItemIndex + 1, 0, itemOrMenuToAdd );
						wasAdded = true;
					}
				}
			}
		}
	} );

	return wasAdded;
}

/**
 * Removes components from the menu bar configuration that are not available in the factory and would
 * not be instantiated. Warns about missing components if the menu bar configuration was specified by the user.
 */
function purgeUnavailableComponents(
	originalConfig: DeepReadonly<NormalizedMenuBarConfigObject>,
	config: NormalizedMenuBarConfigObject,
	componentFactory: ComponentFactory
) {
	walkConfigMenus( config.items, menuDefinition => {
		for ( const groupDefinition of menuDefinition.groups ) {
			groupDefinition.items = groupDefinition.items.filter( item => {
				const isItemUnavailable = typeof item === 'string' && !componentFactory.has( item );

				// The default configuration contains all possible editor features. But integrators' editors rarely load
				// every possible feature. This is why we do not want to log warnings about unavailable items for the default config
				// because they would show up in almost every integration. If the configuration has been provided by
				// the integrator, on the other hand, then these warnings bring value.
				if ( isItemUnavailable && !config.isUsingDefaultConfig ) {
					/**
					 * There was a problem processing the configuration of the menu bar. The item with the given
					 * name does not exist so it was omitted when rendering the menu bar.
					 *
					 * This warning usually shows up when the {@link module:core/plugin~Plugin} which is supposed
					 * to provide a menu bar item has not been loaded or there is a typo in the
					 * {@link module:core/editor/editorconfig~EditorConfig#menuBar menu bar configuration}.
					 *
					 * Make sure the plugin responsible for this menu bar item is loaded and the menu bar configuration
					 * is correct, e.g. {@link module:basic-styles/bold/boldui~BoldUI} is loaded for the `'menuBar:bold'`
					 * menu bar item.
					 *
					 * @error menu-bar-item-unavailable
					 * @param menuBarConfig The full configuration of the menu bar.
					 * @param parentMenuConfig The config of the menu the unavailable component was defined in.
					 * @param componentName The name of the unavailable component.
					 */
					logWarning( 'menu-bar-item-unavailable', {
						menuBarConfig: originalConfig,
						parentMenuConfig: cloneDeep( menuDefinition ),
						componentName: item
					} );
				}

				return !isItemUnavailable;
			} );
		}
	} );
}

/**
 * Removes empty menus from the menu bar configuration to improve the visual UX. Such menus can occur
 * when some plugins responsible for providing menu bar items have not been loaded and some part of
 * the configuration populated menus using these components exclusively.
 */
function purgeEmptyMenus(
	originalConfig: NormalizedMenuBarConfigObject,
	config: NormalizedMenuBarConfigObject
) {
	const isUsingDefaultConfig = config.isUsingDefaultConfig;
	let wasSubMenuPurged = false;

	// Purge top-level menus.
	config.items = config.items.filter( menuDefinition => {
		if ( !menuDefinition.groups.length ) {
			warnAboutEmptyMenu( originalConfig, menuDefinition, isUsingDefaultConfig );

			return false;
		}

		return true;
	} );

	// Warn if there were no top-level menus left in the menu bar after purging.
	if ( !config.items.length ) {
		warnAboutEmptyMenu( originalConfig, originalConfig, isUsingDefaultConfig );

		return;
	}

	// Purge sub-menus and groups.
	walkConfigMenus( config.items, menuDefinition => {
		// Get rid of empty groups.
		menuDefinition.groups = menuDefinition.groups.filter( groupDefinition => {
			if ( !groupDefinition.items.length ) {
				wasSubMenuPurged = true;
				return false;
			}

			return true;
		} );

		// Get rid of empty sub-menus.
		for ( const groupDefinition of menuDefinition.groups ) {
			groupDefinition.items = groupDefinition.items.filter( item => {
				// If no groups were left after removing empty ones.
				if ( isMenuDefinition( item ) && !item.groups.length ) {
					warnAboutEmptyMenu( originalConfig, item, isUsingDefaultConfig );
					wasSubMenuPurged = true;
					return false;
				}

				return true;
			} );
		}
	} );

	if ( wasSubMenuPurged ) {
		// The config is walked from the root to the leaves so if anything gets removed, we need to re-run the
		// whole process because it could've affected parents.
		purgeEmptyMenus( originalConfig, config );
	}
}

function warnAboutEmptyMenu(
	originalConfig: NormalizedMenuBarConfigObject,
	emptyMenuConfig: MenuBarMenuDefinition | DeepReadonly<NormalizedMenuBarConfigObject>,
	isUsingDefaultConfig: boolean
) {
	if ( isUsingDefaultConfig ) {
		return;
	}

	/**
	 * There was a problem processing the configuration of the menu bar. One of the menus
	 * is empty so it was omitted when rendering the menu bar.
	 *
	 * This warning usually shows up when some {@link module:core/plugin~Plugin plugins} responsible for
	 * providing menu bar items have not been loaded and the
	 * {@link module:core/editor/editorconfig~EditorConfig#menuBar menu bar configuration} was not updated.
	 *
	 * Make sure all necessary editor plugins are loaded and/or update the menu bar configuration
	 * to account for the missing menu items.
	 *
	 * @error menu-bar-menu-empty
	 * @param menuBarConfig The full configuration of the menu bar.
	 * @param emptyMenuConfig The definition of the menu that has no child items.
	 */
	logWarning( 'menu-bar-menu-empty', {
		menuBarConfig: originalConfig,
		emptyMenuConfig
	} );
}

/**
 * Localizes the user-config using pre-defined localized category labels.
 */
function localizeMenuLabels( config: NormalizedMenuBarConfigObject, locale: Locale ) {
	const t = locale.t;
	const localizedCategoryLabels: Record<string, string> = {
		// Top-level categories.
		'File': t( {
			string: 'File',
			id: 'MENU_BAR_MENU_FILE'
		} ),
		'Edit': t( {
			string: 'Edit',
			id: 'MENU_BAR_MENU_EDIT'
		} ),
		'View': t( {
			string: 'View',
			id: 'MENU_BAR_MENU_VIEW'
		} ),
		'Insert': t( {
			string: 'Insert',
			id: 'MENU_BAR_MENU_INSERT'
		} ),
		'Format': t( {
			string: 'Format',
			id: 'MENU_BAR_MENU_FORMAT'
		} ),
		'Tools': t( {
			string: 'Tools',
			id: 'MENU_BAR_MENU_TOOLS'
		} ),
		'Help': t( {
			string: 'Help',
			id: 'MENU_BAR_MENU_HELP'
		} ),

		// Sub-menus.
		'Text': t( {
			string: 'Text',
			id: 'MENU_BAR_MENU_TEXT'
		} ),
		'Font': t( {
			string: 'Font',
			id: 'MENU_BAR_MENU_FONT'
		} )
	};

	walkConfigMenus( config.items, definition => {
		if ( definition.label in localizedCategoryLabels ) {
			definition.label = localizedCategoryLabels[ definition.label ];
		}
	} );
}

/**
 * Recursively visits all menu definitions in the config and calls the callback for each of them.
 */
function walkConfigMenus(
	definition: NormalizedMenuBarConfigObject[ 'items' ] | MenuBarMenuDefinition,
	callback: ( definition: MenuBarMenuDefinition ) => void
) {
	if ( Array.isArray( definition ) ) {
		for ( const topLevelMenuDefinition of definition ) {
			walk( topLevelMenuDefinition );
		}
	}

	function walk( menuDefinition: MenuBarMenuDefinition ) {
		callback( menuDefinition );

		for ( const groupDefinition of menuDefinition.groups ) {
			for ( const groupItem of groupDefinition.items ) {
				if ( isMenuDefinition( groupItem ) ) {
					walk( groupItem );
				}
			}
		}
	}
}

function isMenuBarMenuAddition( definition: any ): definition is MenuBarConfigAddedMenu {
	return typeof definition === 'object' && 'menu' in definition;
}

function isMenuBarMenuGroupAddition( definition: any ): definition is MenuBarConfigAddedGroup {
	return typeof definition === 'object' && 'group' in definition;
}

function getRelationFromPosition( position: MenuBarConfigAddedPosition ): 'start' | 'end' | 'before' | 'after' {
	if ( position.startsWith( 'start' ) ) {
		return 'start';
	} else if ( position.startsWith( 'end' ) ) {
		return 'end';
	} else if ( position.startsWith( 'after' ) ) {
		return 'after';
	} else {
		return 'before';
	}
}

function getRelativeIdFromPosition( position: MenuBarConfigAddedPosition ): string | null {
	const match = position.match( /^[^:]+:(.+)/ );

	if ( match ) {
		return match[ 1 ];
	}

	return null;
}

function getIdFromGroupItem( item: string | MenuBarMenuDefinition ): string {
	return typeof item === 'string' ? item : item.menuId;
}

function isMenuDefinition( definition: any ): definition is MenuBarMenuDefinition {
	return typeof definition === 'object' && 'menuId' in definition;
}

/**
 * Initializes menu bar for given editor.
 *
 * @internal
 */
export function _initMenuBar( editor: Editor, menuBarView: MenuBarView ): void {
	const menuBarViewElement = menuBarView.element!;

	editor.ui.focusTracker.add( menuBarViewElement );
	editor.keystrokes.listenTo( menuBarViewElement );

	const normalizedMenuBarConfig = normalizeMenuBarConfig( editor.config.get( 'menuBar' ) || {} );

	menuBarView.fillFromConfig( normalizedMenuBarConfig, editor.ui.componentFactory );

	editor.keystrokes.set( 'Esc', ( data, cancel ) => {
		if ( menuBarViewElement.contains( editor.ui.focusTracker.focusedElement ) ) {
			editor.editing.view.focus();
			cancel();
		}
	} );

	editor.keystrokes.set( 'Alt+F9', ( data, cancel ) => {
		if ( !menuBarViewElement.contains( editor.ui.focusTracker.focusedElement ) ) {
			menuBarView!.focus();
			cancel();
		}
	} );
}

