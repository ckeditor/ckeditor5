/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DropdownMenuListItemButtonView from '../../../../src/dropdown/menu/dropdownmenulistitembuttonview.js';
import DropdownMenuView from '../../../../src/dropdown/menu/dropdownmenuview.js';

import { createTreeFromDropdownMenuView } from '../../../../src/dropdown/menu/search/createtreefromdropdownmenuview.js';
import { ButtonLabelView, DropdownMenuListItemView } from '../../../../src/index.js';

import { createBlankRootListView, createMockDropdownMenuDefinition, createMockLocale } from '../_utils/dropdowntreemock.js';
import {
	createRootTree,
	mapButtonViewToFlatMenuTreeItem,
	mapMenuViewToMenuTreeItem,
	mapMenuViewToMenuTreeItemByLabel
} from '../_utils/dropdowntreeutils.js';

describe( 'createTreeFromDropdownMenuView', () => {
	let locale;

	beforeEach( () => {
		locale = createMockLocale();
	} );

	it( 'should create flatten list of menus', () => {
		const { menusDefinitions, menuRootList } = createMockDropdownMenuDefinition();
		const tree = createTreeFromDropdownMenuView( {
			menuItems: [ ...menuRootList.items ]
		} );

		expect( tree ).to.deep.equal(
			createRootTree( [
				mapMenuViewToMenuTreeItemByLabel(
					'Menu 1',
					tree,
					menusDefinitions[ 0 ].children.map( mapButtonViewToFlatMenuTreeItem )
				),

				mapMenuViewToMenuTreeItemByLabel(
					'Menu 2',
					tree,
					menusDefinitions[ 1 ].children.map( mapButtonViewToFlatMenuTreeItem )
				)
			] )
		);
	} );

	it( 'should reuse custom empty menu instance if provided', () => {
		const { locale, menuRootList } = createBlankRootListView();
		const menuInstance = new DropdownMenuView( locale, 'Hello World' );

		menuRootList.appendTopLevelChild(
			{
				menu: 'Menu Root',
				children: [ menuInstance ]
			}
		);

		const tree = createTreeFromDropdownMenuView( {
			menuItems: [ ...menuRootList.items ]
		} );

		expect( tree ).to.deep.equal(
			createRootTree( [
				mapMenuViewToMenuTreeItemByLabel( 'Menu Root', tree, [
					mapMenuViewToMenuTreeItem( menuInstance )
				] )
			] )
		);
	} );

	it( 'should reuse custom menu instance with custom entries if provided', () => {
		const { locale, menuRootList } = createBlankRootListView();

		const menuInstance = new DropdownMenuView( locale, 'Hello World' );
		const nestedEntries = [
			new DropdownMenuListItemButtonView( locale, 'Hello' ),
			new DropdownMenuListItemButtonView( locale, 'World' )
		];

		menuRootList.appendTopLevelChild(
			{
				menu: 'Menu Root',
				children: [ menuInstance ]
			}
		);

		menuRootList.appendMenuChildren( nestedEntries, menuInstance );

		const tree = createTreeFromDropdownMenuView( {
			menuItems: [ ...menuRootList.items ]
		} );

		expect( tree ).to.deep.equal(
			createRootTree( [
				mapMenuViewToMenuTreeItemByLabel( 'Menu Root', tree, [
					mapMenuViewToMenuTreeItem( menuInstance, nestedEntries.map( mapButtonViewToFlatMenuTreeItem ) )
				] )
			] )
		);
	} );

	it( 'should return empty array of children if it is filled with incorrect records', () => {
		const item = new DropdownMenuListItemView( locale, null, new ButtonLabelView( locale ) );
		const tree = createTreeFromDropdownMenuView( {
			menuItems: [
				item
			]
		} );

		expect( tree.children ).to.be.empty;
	} );
} );
