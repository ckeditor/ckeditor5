/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import DropdownMenuListItemButtonView from '../../../../src/dropdown/menu/dropdownmenulistitembuttonview.js';
import DropdownMenuView from '../../../../src/dropdown/menu/dropdownmenuview.js';

import { ButtonLabelView, DropdownMenuListItemView } from '../../../../src/index.js';
import {
	createTextSearchMetadata,
	createTreeFromDropdownMenuView,
	normalizeSearchText
} from '../../../../src/dropdown/menu/tree/dropdownmenutreecreateutils.js';

import { createBlankRootListView, createMockDropdownMenuDefinition } from '../_utils/dropdowntreemock.js';
import {
	createRootTree,
	mapButtonViewToFlatMenuTreeItem,
	mapMenuViewToMenuTreeItem,
	mapMenuViewToMenuTreeItemByLabel
} from '../_utils/dropdowntreeutils.js';

describe( 'createTreeFromDropdownMenuView', () => {
	let locale, editor, element;

	beforeEach( async () => {
		element = document.body.appendChild(
			document.createElement( 'div' )
		);

		editor = await ClassicTestEditor.create( element );
		locale = editor.locale;
	} );

	afterEach( async () => {
		await editor.destroy();
		element.remove();
	} );

	it( 'should create flatten list of menus', () => {
		const { menusDefinitions, menuRootList } = createMockDropdownMenuDefinition( editor );
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
		const menuRootList = createBlankRootListView( editor );
		const menuInstance = new DropdownMenuView( editor, 'Hello World' );

		menuRootList.factory.appendChild(
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
		const menuRootList = createBlankRootListView( editor );
		const menuInstance = new DropdownMenuView( editor, 'Hello World' );
		const nestedEntries = [
			new DropdownMenuListItemButtonView( locale, 'Hello' ),
			new DropdownMenuListItemButtonView( locale, 'World' )
		];

		menuRootList.factory.appendChild(
			{
				menu: 'Menu Root',
				children: [ menuInstance ]
			}
		);

		menuRootList.factory.appendMenuChildrenAt( nestedEntries, menuInstance );

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

describe( 'Tree Search Metadata', () => {
	describe( 'normalizeSearchText', () => {
		it( 'should trim spaces and lowercase text', () => {
			expect( normalizeSearchText( '  Helooo   ' ) ).to.be.equal( 'helooo' );
		} );
	} );

	describe( 'createTextSearchMetadata', () => {
		it( 'should fallback to blank string if label is undefined', () => {
			const result = createTextSearchMetadata( );

			expect( result ).to.be.deep.equal( {
				raw: '',
				text: ''
			} );
		} );
	} );
} );
