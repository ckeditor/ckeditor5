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
	menu: string;
	children: Array<DropdownMenuChildDefinition>;
};

/**
 * Represents an array of dropdown menu definitions.
 */
export type DropdownMenuDefinitions = Array<DropdownMenuDefinition>;

/**
 * Represents a child definition of a dropdown menu.
 */
export type DropdownMenuChildDefinition =
	| DropdownMenuDefinition
	| DropdownMenuView
	| DropdownMenuListItemButtonView;
