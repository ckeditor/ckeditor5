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
	MenuBarConfig,
	MenuBarMenuMouseEnterEvent,
	MenuBarMenuChangeIsOpenEvent,
	MenuBarMenuArrowRightEvent,
	MenuBarMenuArrowLeftEvent,
	MenuBarMenuDefinition,
	MenuBarConfigObject,
	MenuBarConfigAddedGroup,
	MenuBarConfigAddedMenu,
	MenuBarConfigAddedPosition
} from './menubarview.js';
import { cloneDeep } from 'lodash-es';
import type { FocusableView } from '../focuscycler.js';
import {
	logWarning,
	type Locale,
	type ObservableChangeEvent,
	type PositioningFunction
} from '@ckeditor/ckeditor5-utils';
import type { ButtonExecuteEvent } from '../button/button.js';
import type ComponentFactory from '../componentfactory.js';

const NESTED_PANEL_HORIZONTAL_OFFSET = 5;

type RequitedMenuBarConfigObject = Required<MenuBarConfigObject>;

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

				menuView.isOpen = evt.path.includes( menuView );

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
		menuBarView.on<MenuBarMenuArrowRightEvent>( 'menu:arrowright', evt => {
			cycleTopLevelMenus( evt.source as MenuBarMenuView, 1 );
		} );

		menuBarView.on<MenuBarMenuArrowLeftEvent>( 'menu:arrowleft', evt => {
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
		// TODO: RTL support.
		menuView.keystrokes.set( 'arrowright', ( data, cancel ) => {
			if ( menuView.focusTracker.focusedElement !== menuView.buttonView.element ) {
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
		// TODO: RTL support.
		menuView.keystrokes.set( 'arrowleft', ( data, cancel ) => {
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
 * The default configuration of the {@link module:ui/menubar/menubarview~MenuBarView} component.
 *
 * It contains names of all UI components available in the project.
 */
export const DefaultMenuBarConfig: Array<MenuBarMenuDefinition> = [
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
			}
		]
	},
	{
		menuId: 'insert',
		label: 'Insert',
		groups: [
			{
				groupId: 'insert',
				items: [
					'menuBar:blockQuote',
					'menuBar:htmlEmbed',
					'menuBar:pageBreak',
					'menuBar:horizontalLine',
					'menuBar:blockQuote'
				]
			}
		]
	},
	{
		menuId: 'format',
		label: 'Format',
		groups: [
			{
				groupId: 'table',
				items: [
					'menuBar:insertTable'
				]
			},
			{
				groupId: 'basicStyles',
				items: [
					'menuBar:bold',
					'menuBar:italic',
					'menuBar:underline',
					'menuBar:strikethrough',
					'menuBar:subscript',
					'menuBar:superscript',
					'menuBar:code'
				]
			},
			{
				groupId: 'list',
				items: [
					'menuBar:bulletedList',
					'menuBar:numberedList',
					'menuBar:todoList'
				]
			},
			{
				groupId: 'heading',
				items: [
					'menuBar:heading'
				]
			},
			{
				groupId: 'indent',
				items: [
					'menuBar:indent',
					'menuBar:outdent'
				]
			},
			{
				groupId: 'removeFormat',
				items: [
					'menuBar:removeFormat'
				]
			}
		]
	}
	// {
	// 	id: 'test',
	// 	label: 'Test',
	// 	items: [
	// 		'menuBar:bold',
	// 		'menuBar:italic',
	// 		'menuBar:underline',
	// 		{
	// 			id: 'test-nested-lvl1',
	// 			label: 'Test nested level 1',
	// 			items: [
	// 				'menuBar:undo',
	// 				'menuBar:redo',
	// 				{
	// 					id: 'test-nested-lvl11',
	// 					label: 'Test nested level 1.1',
	// 					items: [
	// 						'menuBar:undo',
	// 						'menuBar:redo'
	// 					]
	// 				}
	// 			]
	// 		},
	// 		{
	// 			id: 'test-nested-lvl2',
	// 			label: 'Test nested level 2',
	// 			items: [
	// 				'menuBar:undo',
	// 				'menuBar:redo',
	// 				{
	// 					id: 'test-nested-lvl21',
	// 					label: 'Test nested level 2.1',
	// 					items: [
	// 						'menuBar:undo',
	// 						'menuBar:redo'
	// 					]
	// 				}
	// 			]
	// 		}
	// 	]
	// }
] as const;

/**
 * Performs a cleanup and normalization of the menu bar configuration and returns a config
 * clone with the following modifications:
 *
 * * Removed components that are not available in the component factory,
 * * Removed obsolete separators,
 * * Purged empty menus,
 * * Localized top-level menu labels.
 */
export function normalizeMenuBarConfig( {
	locale,
	componentFactory,
	config
}: {
	locale: Locale;
	componentFactory: ComponentFactory;
	config: Readonly<MenuBarConfig> | undefined;
} ): MenuBarConfigObject {
	let configObject: RequitedMenuBarConfigObject;

	// The integrator didn't specify any configuration so we use the default one.
	if ( !config ) {
		configObject = {
			items: DefaultMenuBarConfig,
			addItems: [],
			removeItems: []
		};
	}
	// The integrator specified the config as an array. Let's convert it into a generic object config.
	else if ( Array.isArray( config ) ) {
		configObject = {
			items: config,
			addItems: [],
			removeItems: []
		};
	}
	// The integrator specified the config as an object but without items. Let's give them defaults but respect their
	// additions and removals.
	else if ( !( config as MenuBarConfigObject ).items ) {
		configObject = {
			items: DefaultMenuBarConfig,
			addItems: [],
			removeItems: [],
			...config
		};
	}
	// The integrator specified the config as an object and there are items there. Let's take it as it is.
	else {
		configObject = {
			removeItems: [],
			addItems: [],
			...config as MenuBarConfigObject
		};
	}

	const isUsingDefaultConfig = configObject.items === DefaultMenuBarConfig;
	const configClone = cloneDeep( configObject );

	handleRemovals( configClone );
	handleAdditions( configClone );
	purgeUnavailableComponents( configObject, configClone, componentFactory, isUsingDefaultConfig );
	purgeEmptyMenus( configObject, configClone, isUsingDefaultConfig );
	localizeTopLevelCategories( configClone, locale );

	return configClone;
}

/**
 * TODO
 */
function handleRemovals( config: RequitedMenuBarConfigObject ) {
	// Remove top-level menus.
	config.items = config.items.filter( topLevelMenuDefinition => {
		return !config.removeItems!.includes( topLevelMenuDefinition.menuId );
	} );

	walkConfigMenus( config.items, menuDefinition => {
		// Remove groups from menus.
		menuDefinition.groups = menuDefinition.groups.filter( groupDefinition => {
			return !config.removeItems!.includes( groupDefinition.groupId );
		} );

		// Remove sub-menus and items from groups.
		for ( const groupDefinition of menuDefinition.groups ) {
			groupDefinition.items = groupDefinition.items.filter( item => {
				return !config.removeItems!.includes( typeof item == 'string' ? item : item.menuId );
			} );
		}
	} );
}

/**
 * TODO
 */
function handleAdditions( config: RequitedMenuBarConfigObject ) {
	const itemsToAdd = config.addItems;

	for ( const itemToAdd of itemsToAdd ) {
		const relation = getRelationFromPosition( itemToAdd.position );
		const relativeId = getRelativeIdFromPosition( itemToAdd.position );

		// Adding a menu.
		if ( isMenuBarMenuAddition( itemToAdd ) ) {
			// Adding a top-level menu at the beginning of the menu bar.
			if ( relation === 'start' ) {
				config.items.unshift( itemToAdd.menu );
			}
			// Adding a top-level menu at the end of the menu bar.
			else if ( relation === 'end' ) {
				config.items.push( itemToAdd.menu );
			} else {
				const topLevelMenuDefinitionIndex = config.items.findIndex( menuDefinition => menuDefinition.menuId === relativeId );

				// Adding a top-level menu somewhere between existing menu bar menus.
				if ( topLevelMenuDefinitionIndex != -1 ) {
					if ( relation === 'before' ) {
						config.items.splice( topLevelMenuDefinitionIndex, 0, itemToAdd.menu );
					} else if ( relation === 'after' ) {
						config.items.splice( topLevelMenuDefinitionIndex + 1, 0, itemToAdd.menu );
					}
				}
				// Adding a menu to an existing items group.
				else {
					addMenuOrItemToGroup( config, itemToAdd.menu, relativeId, relation );
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
					}
					// Add a group at the end of a menu.
					else if ( relation === 'end' ) {
						menuDefinition.groups.push( itemToAdd.group );
					}
				} else {
					const relativeGroupIndex = menuDefinition.groups.findIndex( group => group.groupId === relativeId );

					if ( relativeGroupIndex !== -1 ) {
						// Add a group before an existing group in a menu.
						if ( relation === 'before' ) {
							menuDefinition.groups.splice( relativeGroupIndex, 0, itemToAdd.group );
						}
						// Add a group after an existing group in a menu.
						else if ( relation === 'after' ) {
							menuDefinition.groups.splice( relativeGroupIndex + 1, 0, itemToAdd.group );
						}
					}
				}
			} );
		}
		// Adding an item to an existing items group.
		else {
			addMenuOrItemToGroup( config, itemToAdd.item, relativeId, relation );
		}
	}
}

function addMenuOrItemToGroup(
	config: RequitedMenuBarConfigObject,
	itemOrMenuToAdd: string | MenuBarMenuDefinition,
	relativeId: string, relation: 'start' | 'end' | 'before' | 'after'
) {
	walkConfigMenus( config.items, menuDefinition => {
		for ( const { groupId, items: groupItems } of menuDefinition.groups ) {
			if ( groupId === relativeId ) {
				// Adding an item/menu at the beginning of a group.
				if ( relation === 'start' ) {
					groupItems.unshift( itemOrMenuToAdd );
				}
				// Adding an item/menu at the end of a group.
				else if ( relation === 'end' ) {
					groupItems.push( itemOrMenuToAdd );
				}
			} else {
				// Adding an item/menu relative to an existing item/menu.
				for ( const groupItem of groupItems ) {
					const itemOrMenuId = getIdFromGroupItem( groupItem );

					if ( itemOrMenuId === relativeId ) {
						if ( relation === 'before' ) {
							groupItems.splice( groupItems.indexOf( groupItem ), 0, itemOrMenuToAdd );
						} else if ( relation === 'after' ) {
							groupItems.splice( groupItems.indexOf( groupItem ) + 1, 0, itemOrMenuToAdd );
						}
					}
				}
			}
		}
	} );
}

/**
 * Removes components from the menu bar configuration that are not available in the factory and would
 * not be instantiated. Warns about missing components if the menu bar configuration was specified by the user.
 */
function purgeUnavailableComponents(
	originalConfig: Readonly<MenuBarConfigObject>,
	config: RequitedMenuBarConfigObject,
	componentFactory: ComponentFactory,
	isUsingDefaultConfig: boolean
) {
	walkConfigMenus( config.items, menuDefinition => {
		for ( const groupDefinition of menuDefinition.groups ) {
			groupDefinition.items = groupDefinition.items.filter( item => {
				const isItemUnavailable = typeof item === 'string' && !componentFactory.has( item );

				// The default configuration contains all possible editor features. But integrators' editors rarely load
				// every possible feature. This is why we do not want to log warnings about unavailable items for the default config
				// because they would show up in almost every integration. If the configuration has been provided by
				// the integrator, on the other hand, then these warnings bring value.
				if ( isItemUnavailable && !isUsingDefaultConfig ) {
					/**
					 * There was a problem processing the configuration of the menu bar. The item with the given
					 * name does not exist so it was omitted when rendering the menu bar.
					 *
					 * This warning usually shows up when the {@link module:core/plugin~Plugin} which is supposed
					 * to provide a menu bar item has not been loaded or there is a typo in the
					 * {@link module:core/editor/editorconfig~EditorConfig#menuBar menu bar configuration}.
					 *
					 * Make sure the plugin responsible for this menu bar item is loaded and the menu bar configuration
					 * is correct, e.g. {@link module:basic-styles/boldyu~BoldUI} is loaded for the `'menuBar:bold'`
					 * menu bar item.
					 *
					 * @error menu-bar-item-unavailable
					 * @param menuBarConfig The full configuration of the menu bar.
					 * @param parentMenuConfig The config of the menu the unavailable component was defined in.
					 * @param componentName The name of the unavailable component.
					 */
					logWarning( 'menu-bar-item-unavailable', {
						menuBarConfig: originalConfig.items,
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
	originalConfig: Readonly<MenuBarConfigObject>,
	config: RequitedMenuBarConfigObject,
	isUsingDefaultConfig: boolean
) {
	let wasSubMenuPurged = false;

	// Purge top-level menus.
	config.items = config.items.filter( menuDefinition => {
		if ( !menuDefinition.groups.length ) {
			warnAboutEmptyMenu( originalConfig.items, menuDefinition, isUsingDefaultConfig );

			return false;
		}

		return true;
	} );

	// Warn if there were no top-level menus left in the menu bar after purging.
	if ( !config.items.length ) {
		warnAboutEmptyMenu( originalConfig.items, originalConfig.items, isUsingDefaultConfig );

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
				if ( typeof item === 'object' && !item.groups.length ) {
					warnAboutEmptyMenu( originalConfig.items, item, isUsingDefaultConfig );
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
		purgeEmptyMenus( originalConfig, config, isUsingDefaultConfig );
	}
}

function warnAboutEmptyMenu(
	menuBarConfig: MenuBarConfig,
	emptyMenuConfig: MenuBarMenuDefinition | Array<MenuBarMenuDefinition>,
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
		menuBarConfig,
		emptyMenuConfig
	} );
}

/**
 * Localizes the user-config using pre-defined localized category labels.
 */
function localizeTopLevelCategories( config: RequitedMenuBarConfigObject, locale: Locale ) {
	const t = locale.t;
	const localizedCategoryLabels: Record<string, string> = {
		'Edit': t( 'Edit' ),
		'Format': t( 'Format' ),
		'View': t( 'View' ),
		'Insert': t( 'Insert' )
	};

	for ( const categoryDef of config.items ) {
		if ( categoryDef.label in localizedCategoryLabels ) {
			categoryDef.label = localizedCategoryLabels[ categoryDef.label ];
		}
	}
}

/**
 * Recursively visits all menu definitions in the config and calls the callback for each of them.
 */
function walkConfigMenus(
	definition: RequitedMenuBarConfigObject[ 'items' ] | MenuBarMenuDefinition,
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
				if ( typeof groupItem === 'object' ) {
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

function getRelativeIdFromPosition( position: MenuBarConfigAddedPosition ): string {
	return position.replace( /^[^:]+:/g, '' );
}

function getIdFromGroupItem( item: string | MenuBarMenuDefinition ): string {
	return typeof item === 'string' ? item : item.menuId;
}
