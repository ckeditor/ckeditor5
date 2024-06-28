/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/utils/dropdownmenupositioningfunctions
 */

import type { PositioningFunction } from '@ckeditor/ckeditor5-utils';

const NESTED_PANEL_HORIZONTAL_OFFSET = 5;

/**
 * Contains every positioning function used by {@link module:ui/dropdown/menu/dropdownmenuview~DropdownMenuView} that decides where the
 * {@link module:ui/dropdown/menu/dropdownmenuview~DropdownMenuView#panelView} should be placed.
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
export const DropdownMenuViewPanelPositioningFunctions: Record<string, PositioningFunction> = {
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
