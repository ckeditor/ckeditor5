/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/dropdown/dropdownpanelfocusable
 */

/**
 * The dropdown panel interface for focusable contents. It provides two methods for managing focus of the contents
 * of dropdown's panel.
 */
export default interface DropdownPanelFocusable {

	/**
	 * Focuses the view element or first item in view collection on opening dropdown's panel.
	 */
	focus(): void;

	/**
	 * Focuses the view element or last item in view collection on opening dropdown's panel.
	 */
	focusLast(): void;
}
