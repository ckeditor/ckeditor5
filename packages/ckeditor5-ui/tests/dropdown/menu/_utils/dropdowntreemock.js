/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * Creates a mock locale object.
 */
export const createMockLocale = () => ( { t() {} } );

/**
 * Creates a mock menu definition.
 *
 * @param label The label of the menu.
 * @param children The children of the menu.
 * @returns The mock menu definition.
 */
export function createMockMenuDefinition( label = 'Menu 1', children = [] ) {
	const menuId = label.toLowerCase().replaceAll( ' ', '_' );

	return {
		id: menuId,
		menu: label,
		children: [
			{ id: menuId + '_foo', label: 'Foo' },
			{ id: menuId + '_bar', label: 'Bar' },
			{ id: menuId + '_buz', label: 'Buz' },
			...children
		]
	};
}
