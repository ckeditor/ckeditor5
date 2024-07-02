/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import DropdownMenuListFoundItemsView from '../../../../src/dropdown/menu/filterview/dropdownmenulistfounditemsview.js';
import DropdownMenuListItemButtonView from '../../../../src/dropdown/menu/dropdownmenulistitembuttonview.js';
import { filterDropdownMenuTreeByRegExp } from '../../../../src/dropdown/menu/tree/dropdownmenutreefilterutils.js';

import { createBlankRootListView, createMockDropdownMenuDefinition } from '../_utils/dropdowntreemock.js';
import { createRootTree } from '../_utils/dropdowntreeutils.js';
import { dumpFoundFilteredDropdownMenuEntries } from '../_utils/dropdownmenufilterviewutils.js';

describe( 'DropdownMenuListFoundItemsView', () => {
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
			return new DropdownMenuListFoundItemsView( locale, createRootTree(), {
				highlightRegex: null,
				limitFoundItemsCount: 50
			} );
		}
	} );

	describe( 'list', () => {
		it( 'should list of filtered flatten items', () => {
			const searchRegexp = /Garlic/gi;
			const menuRootList = createBlankRootListView( editor );

			menuRootList.factory.appendChildren( [
				new DropdownMenuListItemButtonView( locale, 'Bread' ),
				new DropdownMenuListItemButtonView( locale, 'Garlic' )
			] );

			const { filteredTree } = filterDropdownMenuTreeByRegExp( searchRegexp, menuRootList.tree );
			const foundItemsView = new DropdownMenuListFoundItemsView( locale, filteredTree, {
				highlightRegex: searchRegexp,
				limitFoundItemsCount: 50
			} );

			const renderedItems = dumpFoundFilteredDropdownMenuEntries( foundItemsView );

			expect( renderedItems ).to.be.deep.equal( [
				{
					type: 'Item',
					label: 'Garlic'
				}
			] );

			menuRootList.destroy();
		} );

		it( 'should list of filtered group items', () => {
			const searchRegexp = /buz|foo|bread/g;

			const { menuRootList: { tree } } = createMockDropdownMenuDefinition( editor, [
				new DropdownMenuListItemButtonView( locale, 'Bread' )
			] );

			const { filteredTree } = filterDropdownMenuTreeByRegExp( searchRegexp, tree );
			const foundItemsView = new DropdownMenuListFoundItemsView( locale, filteredTree, {
				highlightRegex: searchRegexp,
				limitFoundItemsCount: 50
			} );

			const renderedItems = dumpFoundFilteredDropdownMenuEntries( foundItemsView );

			expect( renderedItems ).to.be.deep.equal( [
				{
					type: 'Group',
					label: 'Menu 1',
					children: [
						{
							type: 'Item',
							label: 'Foo'
						},
						{
							type: 'Item',
							label: 'Buz'
						}
					]
				},
				{
					type: 'Item',
					label: 'Bread'
				}
			] );

			foundItemsView.destroy();
		} );

		describe( 'limits', () => {
			it( 'should limit total amount of found items rendered in group', () => {
				const searchRegexp = /buz|foo|bread/g;

				const { menuRootList: { tree } } = createMockDropdownMenuDefinition( editor, [
					new DropdownMenuListItemButtonView( locale, 'Bread' )
				] );

				const { filteredTree } = filterDropdownMenuTreeByRegExp( searchRegexp, tree );
				const foundItemsView = new DropdownMenuListFoundItemsView( locale, filteredTree, {
					limitFoundItemsCount: 1,
					highlightRegex: searchRegexp
				} );

				const renderedItems = dumpFoundFilteredDropdownMenuEntries( foundItemsView );

				expect( renderedItems ).to.be.deep.equal( [
					{
						type: 'Group',
						label: 'Menu 1',
						children: [
							{
								type: 'Item',
								label: 'Foo'
							}
						]
					}
				] );

				foundItemsView.destroy();
			} );

			it( 'should limit total amount of found items in flat list', () => {
				const searchRegexp = /buz|foo|bread/g;

				const { tree } = createBlankRootListView( editor, [
					new DropdownMenuListItemButtonView( locale, 'Bread 1' ),
					new DropdownMenuListItemButtonView( locale, 'Bread 2' ),
					new DropdownMenuListItemButtonView( locale, 'Bread 3' ),
					new DropdownMenuListItemButtonView( locale, 'Bread 4' )
				] );

				const { filteredTree } = filterDropdownMenuTreeByRegExp( searchRegexp, tree );
				const foundItemsView = new DropdownMenuListFoundItemsView( locale, filteredTree, {
					limitFoundItemsCount: 2,
					highlightRegex: searchRegexp
				} );

				const renderedItems = dumpFoundFilteredDropdownMenuEntries( foundItemsView );

				expect( renderedItems ).to.be.deep.equal( [
					{
						type: 'Item',
						label: 'Bread 1'
					},
					{
						type: 'Item',
						label: 'Bread 2'
					}
				] );

				foundItemsView.destroy();
			} );
		} );

		describe( 'highlight', () => {
			it( 'should highlight found flat items in root element', () => {
				const searchRegexp = /Garlic/gi;
				const menuRootList = createBlankRootListView( editor );

				menuRootList.factory.appendChildren( [
					new DropdownMenuListItemButtonView( locale, 'Bread' ),
					new DropdownMenuListItemButtonView( locale, 'Garlic' ),
					new DropdownMenuListItemButtonView( locale, 'Bear Garlic' )
				] );

				const { filteredTree } = filterDropdownMenuTreeByRegExp( searchRegexp, menuRootList.tree );
				const foundItemsView = new DropdownMenuListFoundItemsView( locale, filteredTree, {
					highlightRegex: searchRegexp,
					limitFoundItemsCount: 50
				} );

				const renderedItems = dumpFoundFilteredDropdownMenuEntries( foundItemsView, { htmlLabel: true } );

				expect( renderedItems ).to.be.deep.equal( [
					{
						type: 'Item',
						label: '<mark>Garlic</mark>'
					},
					{
						type: 'Item',
						label: 'Bear <mark>Garlic</mark>'
					}
				] );

				menuRootList.destroy();
			} );

			it( 'should highlight found group items in multiple groups at the same time', () => {
				const searchRegexp = /Garlic/gi;
				const menuRootList = createBlankRootListView( editor, [
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
				const foundItemsView = new DropdownMenuListFoundItemsView( locale, filteredTree, {
					highlightRegex: searchRegexp,
					limitFoundItemsCount: 50
				} );

				const renderedItems = dumpFoundFilteredDropdownMenuEntries( foundItemsView, { htmlLabel: true } );

				expect( renderedItems ).to.be.deep.equal( [
					{
						type: 'Group',
						label: 'Breakfast',
						children: [
							{
								type: 'Item',
								label: '<mark>Garlic</mark> Onion'
							}
						]
					},
					{
						type: 'Group',
						label: 'Dinner',
						children: [
							{
								type: 'Item',
								label: '<mark>Garlic</mark> Tomatoes'
							},
							{
								type: 'Item',
								label: '<mark>Garlic</mark> Potatoes'
							}
						]
					}
				] );

				menuRootList.destroy();
			} );

			it( 'should highlight whole groups', () => {
				const searchRegexp = /Breakfast/gi;
				const menuRootList = createBlankRootListView( editor, [
					{
						menu: 'Breakfast',
						children: [
							new DropdownMenuListItemButtonView( locale, 'Garlic Onion' )
						]
					}
				] );

				const { filteredTree } = filterDropdownMenuTreeByRegExp( searchRegexp, menuRootList.tree );
				const foundItemsView = new DropdownMenuListFoundItemsView( locale, filteredTree, {
					highlightRegex: searchRegexp,
					limitFoundItemsCount: 50
				} );

				const renderedItems = dumpFoundFilteredDropdownMenuEntries( foundItemsView, { htmlLabel: true } );

				expect( renderedItems ).to.be.deep.equal( [
					{
						type: 'Group',
						label: '<mark>Breakfast</mark>',
						children: [
							{
								type: 'Item',
								label: 'Garlic Onion'
							}
						]
					}
				] );

				menuRootList.destroy();
			} );

			it( 'should highlight whole groups and their children', () => {
				const searchRegexp = /Breakfast/gi;
				const menuRootList = createBlankRootListView( editor, [
					{
						menu: 'Breakfast',
						children: [
							new DropdownMenuListItemButtonView( locale, 'Turbo-Breakfast' ),
							new DropdownMenuListItemButtonView( locale, 'Garlic Onion' )
						]
					}
				] );

				const { filteredTree } = filterDropdownMenuTreeByRegExp( searchRegexp, menuRootList.tree );
				const foundItemsView = new DropdownMenuListFoundItemsView( locale, filteredTree, {
					highlightRegex: searchRegexp,
					limitFoundItemsCount: 50
				} );

				const renderedItems = dumpFoundFilteredDropdownMenuEntries( foundItemsView, { htmlLabel: true } );

				expect( renderedItems ).to.be.deep.equal( [
					{
						type: 'Group',
						label: '<mark>Breakfast</mark>',
						children: [
							{
								type: 'Item',
								label: 'Turbo-<mark>Breakfast</mark>'
							},
							{
								type: 'Item',
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
