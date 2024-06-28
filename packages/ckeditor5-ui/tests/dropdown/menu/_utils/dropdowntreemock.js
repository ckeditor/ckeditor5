/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DropdownMenuListItemButtonView from '../../../../src/dropdown/menu/dropdownmenulistitembuttonview.js';
import DropdownMenuRootListView from '../../../../src/dropdown/menu/dropdownmenurootlistview.js';

/**
 * Creates a mock locale object.
 */
export const createMockLocale = () => ( { t() {} } );

/**
 * Creates a blank root list view for the dropdown menu.
 *
 * @param editor Editor instance.
 * @param definitions The definitions to be added to the root list view.
 * @param menuAttributes The attributes to be added to the menu.
 * @returns An object containing the locale and the menuRootList.
 */
export function createBlankRootListView( editor, definitions = [], menuAttributes = {} ) {
	return new DropdownMenuRootListView( editor, definitions, menuAttributes );
}

/**
 * Creates a mock menu definition.
 *
 * @param label The label of the menu.
 * @param children The children of the menu.
 * @returns The mock menu definition.
 */
export function createMockMenuDefinition( label = 'Menu 1', children = [] ) {
	const locale = createMockLocale();

	return {
		menu: label,
		children: [
			new DropdownMenuListItemButtonView( locale, 'Foo' ),
			new DropdownMenuListItemButtonView( locale, 'Bar' ),
			new DropdownMenuListItemButtonView( locale, 'Buz' ),
			...children
		]
	};
}

/**
 * Creates a mock dropdown menu definition.
 *
 * @param editor Editor instance.
 * @param additionalDefinitions Additional menu definitions to be added.
 * @returns The mock dropdown menu definition.
 */
export function createMockDropdownMenuDefinition( editor, additionalDefinitions = [] ) {
	const menuRootList = createBlankRootListView( editor );
	const menusDefinitions = [
		createMockMenuDefinition(),
		{
			menu: 'Menu 2',
			children: [
				new DropdownMenuListItemButtonView( editor.locale, 'A' ),
				new DropdownMenuListItemButtonView( editor.locale, 'B' )
			]
		},
		...additionalDefinitions
	];

	menuRootList.factory.appendChildren( menusDefinitions );

	return {
		menuRootList,
		menusDefinitions
	};
}
