/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/typings
 */

import type ListSeparatorView from '../../list/listseparatorview.js';
import type DropdownMenuListItemView from './dropdownmenulistitemview.js';

/**
 * Represents a view for a nested menu list item in a dropdown menu.
 */
export type DropdownNestedMenuListItemView = DropdownMenuListItemView | ListSeparatorView;
