/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/definition/dropdownmenudefinitiontypings
 */

import type { DropdownMenuOrFlatItemView } from '../typings.js';

/**
 * Represents a child definition of a dropdown menu.
 * It can be either a `DropdownMenuDefinition` or a `DropdownMenuOrFlatItemView`.
 */
export type DropdownMenuChildDefinition = DropdownMenuDefinition | DropdownMenuOrFlatItemView;

/**
 * Represents the children of a dropdown menu.
 */
export type DropdownMenuChildrenDefinition = Array<DropdownMenuChildDefinition>;

/**
 * Represents the definition of a dropdown menu.
 */
export type DropdownMenuDefinition = {
	menu: string;
	children: DropdownMenuChildrenDefinition;
};

/**
 * Represents an array of dropdown menu definitions.
 */
export type DropdownMenuDefinitions = Array<DropdownMenuDefinition>;
