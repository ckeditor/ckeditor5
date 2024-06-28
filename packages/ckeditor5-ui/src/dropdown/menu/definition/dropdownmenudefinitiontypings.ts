/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/definition/dropdownmenudefinitiontypings
 */

import type DropdownMenuListItemButtonView from '../dropdownmenulistitembuttonview.js';
import type DropdownMenuView from '../dropdownmenuview.js';

/**
 * Represents the definition of a dropdown menu.
 */
export type DropdownMenuDefinition = {

	/**
	 * The name of the dropdown menu.
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
/**
 * Represents the definition of a dropdown menu item.
 */
export type DropdownMenuItemDefinition = {

	/**
	 * The name of the dropdown menu item.
	 */
	label: string;

	/**
	 * The icon associated with the dropdown menu item.
	 */
	icon?: string | undefined;

	/**
	 * The function to be executed when the dropdown menu item is selected.
	 */
	onExecute: VoidFunction;
};

/**
 * Represents a child definition of a dropdown menu.
 */
export type DropdownMenuChildDefinition =
	| DropdownMenuDefinition
	| DropdownMenuItemDefinition
	| DropdownMenuView
	| DropdownMenuListItemButtonView;
