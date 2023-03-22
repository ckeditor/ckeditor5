/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/button/dropdownbutton
 */

import type Button from '../../button/button';
import type ViewCollection from '../../viewcollection';

/**
 * The dropdown button interface.
 */
export default interface DropdownButton extends Button {

	/**
	 * The value of the `aria-haspopup` attribute of the button.
	 *
	 * @observable
	 */
	ariaHasPopup: string | boolean;

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
