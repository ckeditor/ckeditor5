/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/events
 */

import type { BaseEvent } from '@ckeditor/ckeditor5-utils';

/**
 * Represents a dropdown menu event.
 */
interface DropdownMenuEvent extends BaseEvent {

	/**
	 * The name of the event.
	 */
	name: `menu:${ string }` | `menu:change:${ string }`;
}

/**
 * Represents a dropdown menu mouse enter event.
 */
export interface DropdownMenuMouseEnterEvent extends DropdownMenuEvent {

	/**
	 * The name of the event.
	 */
	name: 'menu:mouseenter';
}

/**
 * Represents a dropdown menu change is open event.
 */
export interface DropdownMenuChangeIsOpenEvent extends DropdownMenuEvent {

	/**
	 * The name of the event.
	 */
	name: 'menu:change:isOpen';

	/**
	 * The arguments of the event.
	 */
	args: [ name: string, value: boolean, oldValue: boolean ];
}
