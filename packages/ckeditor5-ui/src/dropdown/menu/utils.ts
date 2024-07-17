/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/utils
 */

import type { PositioningFunction } from '@ckeditor/ckeditor5-utils';

const NESTED_PANEL_HORIZONTAL_OFFSET = 5;

/**
 * Contains every positioning function used by {@link module:ui/dropdown/menu/dropdownnestedmenuview~DropdownNestedMenuView} that
 * decides where the {@link module:ui/dropdown/menu/dropdownnestedmenuview~DropdownNestedMenuView#panelView} should be placed.
 *
 * Positioning functions:
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
export const DropdownNestedMenuViewPanelPositioningFunctions: Record<string, PositioningFunction> = {
	eastSouth: buttonRect => ( {
		top: buttonRect.top,
		left: buttonRect.right - NESTED_PANEL_HORIZONTAL_OFFSET,
		name: 'es'
	} ),

	eastNorth: ( buttonRect, panelRect ) => ( {
		top: buttonRect.top - panelRect.height + buttonRect.height,
		left: buttonRect.right - NESTED_PANEL_HORIZONTAL_OFFSET,
		name: 'en'
	} ),

	westSouth: ( buttonRect, panelRect ) => ( {
		top: buttonRect.top,
		left: buttonRect.left - panelRect.width + NESTED_PANEL_HORIZONTAL_OFFSET,
		name: 'ws'
	} ),

	westNorth: ( buttonRect, panelRect ) => ( {
		top: buttonRect.top - panelRect.height + buttonRect.height,
		left: buttonRect.left - panelRect.width + NESTED_PANEL_HORIZONTAL_OFFSET,
		name: 'wn'
	} )
} as const;

/**
 * Represents the definition of a dropdown menu.
 */
export type DropdownMenuDefinition = {

	/**
	 * Unique ID for the menu.
	 */
	id: string;

	/**
	 * The menu name. It is used as a label for the button which opens the menu list.
	 */
	menu: string;

	/**
	 * The children of the dropdown menu.
	 */
	children: Array<DropdownMenuChildDefinition>;
};

/**
 * Represents the definition of a dropdown menu item.
 */
export type DropdownMenuButtonDefinition = {

	/**
	 * Unique ID for the button.
	 */
	id: string;

	/**
	 * The label for the button.
	 */
	label: string;
};

/**
 * Represents a definition of a child of a dropdown menu.
 */
export type DropdownMenuChildDefinition = DropdownMenuDefinition | DropdownMenuButtonDefinition;
