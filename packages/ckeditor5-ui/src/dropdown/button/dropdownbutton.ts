/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/dropdown/button/dropdownbutton
 */

import type Button from '../../button/button.js';
import type ViewCollection from '../../viewcollection.js';

/**
 * The dropdown button interface.
 */
export default interface DropdownButton extends Button {
	children: ViewCollection;
}

/**
 * Fired when the dropdown should be opened.
 * It will not be fired when the button {@link module:ui/dropdown/button/dropdownbutton~DropdownButton#isEnabled is disabled}.
 *
 * @eventName ~DropdownButton#open
 */
export type DropdownButtonOpenEvent = {
	name: 'open';
	args: [];
};
