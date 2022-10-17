/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type Button from '../../button/button';

/**
 * @module ui/dropdown/button/dropdownbutton
 */

/**
 * The dropdown button interface.
 *
 * @interface module:ui/dropdown/button/dropdownbutton~DropdownButton
 * @extends module:ui/button/button~Button
 */
export default interface DropdownButton extends Button {}

/**
 * Fired when the dropdown should be opened.
 * It will not be fired when the button {@link #isEnabled is disabled}.
 *
 * @event open
 */

export type DropdownButtonOpenEvent = {
    name: 'open';
    args: [];
};
