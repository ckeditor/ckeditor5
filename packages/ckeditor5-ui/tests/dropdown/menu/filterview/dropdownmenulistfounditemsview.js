/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import DropdownMenuListFoundItemsView from '../../../../src/dropdown/menu/filterview/dropdownmenulistfounditemsview.js';
import DropdownMenuListItemButtonView from '../../../../src/dropdown/menu/dropdownmenulistitembuttonview.js';
import { filterDropdownMenuTreeByRegExp } from '../../../../src/dropdown/menu/search/filterdropdownmenutreebyregexp.js';

import { createBlankRootListView, createMockDropdownMenuDefinition, createMockLocale } from '../_utils/dropdowntreemock.js';
import { createRootTree } from '../_utils/dropdowntreeutils.js';
import { dumpFoundFilteredDropdownMenuEntries } from '../_utils/dropdownmenufilterviewutils.js';

describe( 'DropdownMenuListFoundItemsView', () => {
	let locale;

	beforeEach( () => {
		locale = createMockLocale();
	} );

	describe( 'constructor()', () => {
		it( 'should create instance of DropdownMenuListFoundItemsView', () => {
			const listView = createBlankMenuListFoundItemsView();

			expect( listView ).to.be.instanceOf( DropdownMenuListFoundItemsView );
		} );

		it( 'should set proper listbox role', () => {
			const listView = createBlankMenuListFoundItemsView();

			expect( listView.role ).to.be.equal( 'listbox' );
		} );

		function createBlankMenuListFoundItemsView() {
			return new DropdownMenuListFoundItemsView( locale, null, createRootTree() );
		}
	} );

	describe( 'list', () => {
		it( 'should list of filtered flatten items', () => {
			const searchRegexp = /Garlic/gi;
			const { menuRootList } = createBlankRootListView();

			menuRootList.appendTopLevelChildren( [
				new DropdownMenuListItemButtonView( locale, 'Bread' ),
				new DropdownMenuListItemButtonView( locale, 'Garlic' )
			] );

			const { filteredTree } = filterDropdownMenuTreeByRegExp( searchRegexp, menuRootList.tree );
			const foundItemsView = new DropdownMenuListFoundItemsView( locale, searchRegexp, filteredTree );
			const renderedItems = dumpFoundFilteredDropdownMenuEntries( foundItemsView );

			expect( renderedItems ).to.be.deep.equal( [
				{
					kind: 'Item',
					label: 'Garlic'
				}
			] );

			menuRootList.destroy();
		} );

		it( 'should list of filtered group items', () => {
			const searchRegexp = /buz|foo|bread/g;

			const { menuRootList: { tree } } = createMockDropdownMenuDefinition( [
				new DropdownMenuListItemButtonView( locale, 'Bread' )
			] );

			const { filteredTree } = filterDropdownMenuTreeByRegExp( searchRegexp, tree );

			const foundItemsView = new DropdownMenuListFoundItemsView( locale, searchRegexp, filteredTree );
			const renderedItems = dumpFoundFilteredDropdownMenuEntries( foundItemsView );

			expect( renderedItems ).to.be.deep.equal( [
				{
					kind: 'Group',
					label: 'Menu 1',
					children: [
						{
							kind: 'Item',
							label: 'Foo'
						},
						{
							kind: 'Item',
							label: 'Buz'
						}
					]
				},
				{
					kind: 'Item',
					label: 'Bread'
				}
			] );

			foundItemsView.destroy();
		} );

		describe( 'highlight', () => {
			it( 'should highlight found flat items in root element', () => {
				const searchRegexp = /Garlic/gi;
				const { menuRootList } = createBlankRootListView();

				menuRootList.appendTopLevelChildren( [
					new DropdownMenuListItemButtonView( locale, 'Bread' ),
					new DropdownMenuListItemButtonView( locale, 'Garlic' ),
					new DropdownMenuListItemButtonView( locale, 'Bear Garlic' )
				] );

				const { filteredTree } = filterDropdownMenuTreeByRegExp( searchRegexp, menuRootList.tree );
				const foundItemsView = new DropdownMenuListFoundItemsView( locale, searchRegexp, filteredTree );
				const renderedItems = dumpFoundFilteredDropdownMenuEntries( foundItemsView, { htmlLabel: true } );

				expect( renderedItems ).to.be.deep.equal( [
					{
						kind: 'Item',
						label: '<mark>Garlic</mark>'
					},
					{
						kind: 'Item',
						label: 'Bear <mark>Garlic</mark>'
					}
				] );

				menuRootList.destroy();
			} );

			it( 'should highlight found group items in multiple groups at the same time', () => {
				const searchRegexp = /Garlic/gi;
				const { menuRootList } = createBlankRootListView( [
					{
						menu: 'Breakfast',
						children: [
							new DropdownMenuListItemButtonView( locale, 'Bread' ),
							new DropdownMenuListItemButtonView( locale, 'Garlic Onion' )
						]
					},
					{
						menu: 'Dinner',
						children: [
							new DropdownMenuListItemButtonView( locale, 'Hamburger' ),
							new DropdownMenuListItemButtonView( locale, 'Garlic Tomatoes' ),
							new DropdownMenuListItemButtonView( locale, 'Garlic Potatoes' )
						]
					}
				] );

				const { filteredTree } = filterDropdownMenuTreeByRegExp( searchRegexp, menuRootList.tree );
				const foundItemsView = new DropdownMenuListFoundItemsView( locale, searchRegexp, filteredTree );
				const renderedItems = dumpFoundFilteredDropdownMenuEntries( foundItemsView, { htmlLabel: true } );

				expect( renderedItems ).to.be.deep.equal( [
					{
						kind: 'Group',
						label: 'Breakfast',
						children: [
							{
								kind: 'Item',
								label: '<mark>Garlic</mark> Onion'
							}
						]
					},
					{
						kind: 'Group',
						label: 'Dinner',
						children: [
							{
								kind: 'Item',
								label: '<mark>Garlic</mark> Tomatoes'
							},
							{
								kind: 'Item',
								label: '<mark>Garlic</mark> Potatoes'
							}
						]
					}
				] );

				menuRootList.destroy();
			} );

			it( 'should highlight whole groups', () => {
				const searchRegexp = /Breakfast/gi;
				const { menuRootList } = createBlankRootListView( [
					{
						menu: 'Breakfast',
						children: [
							new DropdownMenuListItemButtonView( locale, 'Garlic Onion' )
						]
					}
				] );

				const { filteredTree } = filterDropdownMenuTreeByRegExp( searchRegexp, menuRootList.tree );
				const foundItemsView = new DropdownMenuListFoundItemsView( locale, searchRegexp, filteredTree );
				const renderedItems = dumpFoundFilteredDropdownMenuEntries( foundItemsView, { htmlLabel: true } );

				expect( renderedItems ).to.be.deep.equal( [
					{
						kind: 'Group',
						label: '<mark>Breakfast</mark>',
						children: [
							{
								kind: 'Item',
								label: 'Garlic Onion'
							}
						]
					}
				] );

				menuRootList.destroy();
			} );

			it( 'should highlight whole groups and their children', () => {
				const searchRegexp = /Breakfast/gi;
				const { menuRootList } = createBlankRootListView( [
					{
						menu: 'Breakfast',
						children: [
							new DropdownMenuListItemButtonView( locale, 'Turbo-Breakfast' ),
							new DropdownMenuListItemButtonView( locale, 'Garlic Onion' )
						]
					}
				] );

				const { filteredTree } = filterDropdownMenuTreeByRegExp( searchRegexp, menuRootList.tree );
				const foundItemsView = new DropdownMenuListFoundItemsView( locale, searchRegexp, filteredTree );
				const renderedItems = dumpFoundFilteredDropdownMenuEntries( foundItemsView, { htmlLabel: true } );

				expect( renderedItems ).to.be.deep.equal( [
					{
						kind: 'Group',
						label: '<mark>Breakfast</mark>',
						children: [
							{
								kind: 'Item',
								label: 'Turbo-<mark>Breakfast</mark>'
							},
							{
								kind: 'Item',
								label: 'Garlic Onion'
							}
						]
					}
				] );

				menuRootList.destroy();
			} );
		} );
	} );
} );
