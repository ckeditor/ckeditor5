/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/guards
 */

import type { DropdownMenuFocusableFlatItemView } from './typings.js';

import DropdownMenuListItemButtonView from './dropdownmenulistitembuttonview.js';
import DropdownMenuView from './dropdownmenuview.js';
import DropdownMenuListItemView from './dropdownmenulistitemview.js';
import ListSeparatorView from '../../list/listseparatorview.js';

/**
 * Checks if the given object is an instance of DropdownMenuView.
 *
 * @param obj The object to check.
 * @returns A boolean indicating whether the object is an instance of DropdownMenuView.
 */
export const isDropdownMenuView = ( obj: any ): obj is DropdownMenuView =>
	obj instanceof DropdownMenuView;

/**
 * Checks if the given object is an instance of ListSeparatorView.
 *
 * @param obj The object to check.
 * @returns A boolean indicating whether the object is an instance of ListSeparatorView.
 */
export const isDropdownListItemSeparatorView = ( obj: any ): obj is ListSeparatorView =>
	obj instanceof ListSeparatorView;

/**
 * Checks if the given object is an instance of `DropdownMenuFocusableFlatItemView`.
 *
 * @param obj The object to check.
 * @returns `true` if the object is an instance of `DropdownMenuFocusableFlatItemView`, `false` otherwise.
 */
export const isDropdownMenuFocusableFlatItemView = ( obj: any ): obj is DropdownMenuFocusableFlatItemView =>
	obj instanceof DropdownMenuListItemButtonView;

/**
 * Checks if the given object is an instance of `DropdownMenuListItemView`.
 *
 * @param obj The object to check.
 * @returns A boolean indicating whether the object is an instance of `DropdownMenuListItemView`.
 */
export const isDropdownMenuListItemView = ( obj: any ): obj is DropdownMenuListItemView =>
	obj instanceof DropdownMenuListItemView;
