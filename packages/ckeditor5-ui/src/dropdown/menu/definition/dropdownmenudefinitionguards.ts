/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/definition/dropdownmenudefinitionguards
 */

import type { DropdownMenuDefinition } from './dropdownmenudefinitiontypings.js';

/**
 * Checks if the given object is a valid DropdownMenuDefinition.
 *
 * @param obj The object to be checked.
 * @returns A boolean indicating whether the object is a valid DropdownMenuDefinition.
 */
export const isDropdownMenuObjectDefinition = ( obj: any ): obj is DropdownMenuDefinition =>
	!!obj && typeof obj === 'object' && 'menu' in obj && 'children' in obj;
