/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { getTotalDropdownMenuTreeFlatItemsCount } from '../../../../src/dropdown/menu/tree/dropdownmenutreeflattenutils.js';
import {
	filterDropdownMenuTree,
	filterDropdownMenuTreeByRegExp,
	shallowCloneDropdownMenuTree,
	tryRemoveDropdownMenuTreeChild,
	groupDropdownTreeByFirstFoundParent
} from '../../../../src/dropdown/menu/tree/dropdownmenutreefilterutils.js';

import { createMockDropdownMenuDefinition } from '../_utils/dropdowntreemock.js';
import {
	createRootTree,
	findMenuTreeItemByLabel,
	mapButtonViewToFlatMenuTreeItem,
	mapMenuViewToMenuTreeItemByLabel,
	markAsFound
} from '../_utils/dropdowntreeutils.js';

describe( 'filterDropdownMenuTree', () => {
	let editor, element;

	beforeEach( async () => {
		element = document.body.appendChild(
			document.createElement( 'div' )
		);

		editor = await ClassicTestEditor.create( element );
	} );

	afterEach( async () => {
		await editor.destroy();
		element.remove();
	} );

	it( 'should return 0 found items on empty tree', () => {
		const result = filterDropdownMenuTree( () => true, createRootTree() );

		expect( result ).to.deep.equal( {
			resultsCount: 0,
			totalItemsCount: 0,
			filteredTree: createRootTree()
		} );
	} );

	it( 'should return all menu children if menu label matches', () => {
		const { menuRootList, menusDefinitions } = createMockDropdownMenuDefinition( editor );
		const { tree } = menuRootList;

		const { resultsCount, filteredTree, totalItemsCount } = filterDropdownMenuTree(
			node => node.search.raw === 'Menu 1',
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

	it( 'should return child if label matches', () => {
		const { menuRootList, menusDefinitions } = createMockDropdownMenuDefinition( editor );
		const { tree } = menuRootList;

		const { resultsCount, filteredTree, totalItemsCount } = filterDropdownMenuTree(
			node => node.search.raw === 'Foo',
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
		const { menuRootList } = createMockDropdownMenuDefinition( editor );

		const tree = Object.freeze( menuRootList.tree );
		const { filteredTree } = filterDropdownMenuTree(
			node => node.search.raw === 'Foo',
			tree
		);

		expect( filteredTree ).not.to.be.equal( tree );
		expect( getTotalDropdownMenuTreeFlatItemsCount( filteredTree ) ).not.to.be.equal(
			getTotalDropdownMenuTreeFlatItemsCount( tree )
		);
	} );
} );

describe( 'filterDropdownMenuTreeByRegExp', () => {
	let editor, element;

	beforeEach( async () => {
		element = document.body.appendChild(
			document.createElement( 'div' )
		);

		editor = await ClassicTestEditor.create( element );
	} );

	afterEach( async () => {
		await editor.destroy();
		element.remove();
	} );

	it( 'should return 0 found items on empty tree', () => {
		const result = filterDropdownMenuTreeByRegExp( /[.*]/g, createRootTree() );

		expect( result ).to.deep.equal( {
			resultsCount: 0,
			totalItemsCount: 0,
			filteredTree: createRootTree()
		} );
	} );

	it( 'should return all menu children if menu label matches', () => {
		const { menuRootList, menusDefinitions } = createMockDropdownMenuDefinition( editor );
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
		const { menuRootList, menusDefinitions } = createMockDropdownMenuDefinition( editor );
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
		const { menuRootList, menusDefinitions } = createMockDropdownMenuDefinition( editor );
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
		const { menuRootList } = createMockDropdownMenuDefinition( editor );

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

describe( 'shallowCloneDropdownMenuTree', () => {
	let editor, element;

	beforeEach( async () => {
		element = document.body.appendChild(
			document.createElement( 'div' )
		);

		editor = await ClassicTestEditor.create( element );
	} );

	afterEach( async () => {
		await editor.destroy();
		element.remove();
	} );

	it( 'should clone tree with nested children (except views)', () => {
		const { menuRootList } = createMockDropdownMenuDefinition( editor );

		const tree = Object.freeze( menuRootList.tree );
		const clonedTree = shallowCloneDropdownMenuTree( tree );

		clonedTree.children.push( 2 );
		clonedTree.children[ 0 ].children.push( 3 );

		expect( clonedTree ).not.to.be.equal( tree );
		expect( clonedTree.children[ 0 ].menu ).to.be.equal( tree.children[ 0 ].menu );
	} );
} );

describe( 'tryRemoveDropdownMenuTreeChild', () => {
	let editor, element;

	beforeEach( async () => {
		element = document.body.appendChild(
			document.createElement( 'div' )
		);

		editor = await ClassicTestEditor.create( element );
	} );

	afterEach( async () => {
		await editor.destroy();
		element.remove();
	} );

	it( 'should remove menu child from root node', () => {
		const { menuRootList } = createMockDropdownMenuDefinition( editor );
		const { tree } = menuRootList;
		const [ child ] = tree.children;

		const resultTree = tryRemoveDropdownMenuTreeChild( tree, child );

		expect( tree ).to.be.equal( resultTree );
		expect( tree.children ).not.to.contain( child );
	} );

	it( 'should remove menu child from menu node', () => {
		const { menuRootList } = createMockDropdownMenuDefinition( editor );
		const { tree } = menuRootList;

		const [ parent ] = tree.children;
		const [ child ] = parent.children;

		tryRemoveDropdownMenuTreeChild( parent, child );
		expect( parent.children ).not.to.contain( child );
	} );

	it( 'should do do nothing on item entry', () => {
		const { menuRootList } = createMockDropdownMenuDefinition( editor );
		const { tree } = menuRootList;

		const [ parent ] = tree.children;
		const [ child ] = parent.children;

		expect( () => {
			tryRemoveDropdownMenuTreeChild( child, null );
		} ).not.to.throw();
	} );

	it( 'should throw on unknown entry', () => {
		expect( () => {
			tryRemoveDropdownMenuTreeChild( {}, null );
		} ).to.throw();
	} );
} );

describe( 'groupDropdownTreeByFirstFoundParent', () => {
	let editor, element;

	beforeEach( async () => {
		element = document.body.appendChild(
			document.createElement( 'div' )
		);

		editor = await ClassicTestEditor.create( element );
	} );

	afterEach( async () => {
		await editor.destroy();
		element.remove();
	} );

	it( 'should return 0 results if passed empty tree', () => {
		const result = groupDropdownTreeByFirstFoundParent( createRootTree() );

		expect( result ).to.be.deep.equal( [] );
	} );

	it( 'should all children of menu entry if it\'s marked as found', () => {
		const { groupedList, byLabel } = filterByRegExpMock( /Menu 1/gi );

		expect( groupedList ).to.deep.equal(
			[
				{
					parent: byLabel( 'Menu 1' ),
					children: [ byLabel( 'Foo' ), byLabel( 'Bar' ), byLabel( 'Buz' ) ]
				}
			]
		);
	} );

	it( 'should return matching flat item child', () => {
		const { groupedList, byLabel } = filterByRegExpMock( /Buz/gi );

		expect( groupedList ).to.deep.equal(
			[
				{
					parent: byLabel( 'Menu 1' ),
					children: [ byLabel( 'Buz' ) ]
				}
			]
		);
	} );

	function filterByRegExpMock( regexp ) {
		const { menuRootList: { tree } } = createMockDropdownMenuDefinition( editor );
		const { filteredTree } = filterDropdownMenuTreeByRegExp( regexp, tree );

		const byLabel = label => findMenuTreeItemByLabel( label, filteredTree );
		const groupedList = groupDropdownTreeByFirstFoundParent( filteredTree );

		return {
			filteredTree,
			groupedList,
			byLabel
		};
	}
} );
