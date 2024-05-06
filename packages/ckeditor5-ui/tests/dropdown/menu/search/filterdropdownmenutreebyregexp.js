/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { filterDropdownMenuTreeByRegExp } from '../../../../src/dropdown/menu/search/filterdropdownmenutreebyregexp.js';
import {
	getTotalDropdownMenuTreeFlatItemsCount
} from '../../../../src/dropdown/menu/search/gettotaldropdownmenutreeflatitemscount.js';

import { createMockDropdownMenuDefinition } from '../_utils/dropdowntreemock.js';
import {
	createRootTree,
	mapButtonViewToFlatMenuTreeItem,
	mapMenuViewToMenuTreeItemByLabel,
	markAsFound
} from '../_utils/dropdowntreeutils.js';

describe( 'filterDropdownMenuTreeByRegExp', () => {
	it( 'should return 0 found items on empty tree', () => {
		const result = filterDropdownMenuTreeByRegExp( /[.*]/g, createRootTree() );

		expect( result ).to.deep.equal( {
			resultsCount: 0,
			totalItemsCount: 0,
			filteredTree: createRootTree()
		} );
	} );

	it( 'should return all menu children if menu label matches', () => {
		const { menuRootList, menusDefinitions } = createMockDropdownMenuDefinition();
		const { tree } = menuRootList;
		const { resultsCount, filteredTree, totalItemsCount } = filterDropdownMenuTreeByRegExp(
			/Menu 1/ig,
			tree
		);

		expect( resultsCount ).to.be.equal( 3 );
		expect( totalItemsCount ).to.be.equal( 5 );
		expect( filteredTree ).to.deep.equal(
			createRootTree( [
				markAsFound(
					mapMenuViewToMenuTreeItemByLabel(
						'Menu 1',
						tree,
						menusDefinitions[ 0 ].children.map( mapButtonViewToFlatMenuTreeItem )
					)
				)
			] )
		);
	} );

	it( 'should return all child items if regexp is null', () => {
		const { menuRootList, menusDefinitions } = createMockDropdownMenuDefinition();
		const { tree } = menuRootList;
		const { resultsCount, filteredTree, totalItemsCount } = filterDropdownMenuTreeByRegExp( null, tree );

		expect( resultsCount ).to.be.equal( 5 );
		expect( totalItemsCount ).to.be.equal( 5 );
		expect( filteredTree ).to.deep.equal(
			createRootTree( [
				markAsFound(
					mapMenuViewToMenuTreeItemByLabel(
						'Menu 1',
						tree,
						menusDefinitions[ 0 ].children.map( mapButtonViewToFlatMenuTreeItem )
					)
				),

				markAsFound(
					mapMenuViewToMenuTreeItemByLabel(
						'Menu 2',
						tree,
						menusDefinitions[ 1 ].children.map( mapButtonViewToFlatMenuTreeItem )
					)
				)
			] )
		);
	} );

	it( 'should return child if label matches', () => {
		const { menuRootList, menusDefinitions } = createMockDropdownMenuDefinition();
		const { tree } = menuRootList;

		const { resultsCount, filteredTree, totalItemsCount } = filterDropdownMenuTreeByRegExp(
			/Foo/ig,
			tree
		);

		expect( resultsCount ).to.be.equal( 1 );
		expect( totalItemsCount ).to.be.equal( 5 );
		expect( filteredTree ).to.deep.equal(
			createRootTree( [
				mapMenuViewToMenuTreeItemByLabel(
					'Menu 1',
					tree,
					[
						mapButtonViewToFlatMenuTreeItem( menusDefinitions[ 0 ].children[ 0 ] )
					].map( markAsFound )
				)
			] )
		);
	} );

	it( 'should not modify passed tree object', () => {
		const { menuRootList } = createMockDropdownMenuDefinition();

		const tree = Object.freeze( menuRootList.tree );
		const { filteredTree } = filterDropdownMenuTreeByRegExp(
			/Foo/gi,
			tree
		);

		expect( filteredTree ).not.to.be.equal( tree );
		expect( getTotalDropdownMenuTreeFlatItemsCount( filteredTree ) ).not.to.be.equal(
			getTotalDropdownMenuTreeFlatItemsCount( tree )
		);
	} );
} );
