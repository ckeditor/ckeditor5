/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import { walkOverDropdownMenuTreeItems } from '../../../../src/dropdown/menu/tree/dropdownmenutreewalker.js';

import { createMockDropdownMenuDefinition } from '../_utils/dropdowntreemock.js';
import { createRootTree } from '../_utils/dropdowntreeutils.js';

describe( 'walkOverDropdownMenuTreeItems', () => {
	let element, editor;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );
		editor = await ClassicTestEditor.create( element );
	} );

	afterEach( async () => {
		await editor.destroy();
		element.remove();
	} );

	it( 'should not crash if passed blank tree', () => {
		const tree = createRootTree();

		expect( () => {
			walkOverDropdownMenuTreeItems( {}, tree );
		} ).not.to.throw();
	} );

	it( 'should walk through tree in correct order', () => {
		const { menuRootList } = createMockDropdownMenuDefinition( editor );
		const { tree } = menuRootList;

		const tracking = {
			entered: [],
			left: []
		};

		const trackedWalkers = {
			enter: ( { node } ) => {
				tracking.entered.push( node.search.raw );
			},
			leave: ( { node } ) => {
				tracking.left.unshift( node.search.raw );
			}
		};

		walkOverDropdownMenuTreeItems(
			{
				Item: trackedWalkers,
				Menu: trackedWalkers
			},
			tree
		);

		expect( tracking.entered ).to.be.deep.equal( [
			'Menu 1', 'Foo', 'Bar', 'Buz', 'Menu 2', 'A', 'B'
		] );

		expect( tracking.left ).to.be.deep.equal( [
			'Menu 2', 'B', 'A', 'Menu 1', 'Buz', 'Bar', 'Foo'
		] );
	} );

	it( 'should be possible to pass walker inline enter function', () => {
		const { menuRootList } = createMockDropdownMenuDefinition( editor );
		const { tree } = menuRootList;

		const entered = [];
		const trackedWalkers = ( { node } ) => {
			entered.push( node.search.raw );
		};

		walkOverDropdownMenuTreeItems(
			{
				Item: trackedWalkers,
				Menu: trackedWalkers
			},
			tree
		);

		expect( entered ).to.be.deep.equal( [
			'Menu 1', 'Foo', 'Bar', 'Buz', 'Menu 2', 'A', 'B'
		] );
	} );

	it( 'default walker should walk through tree in correct order', () => {
		const { menuRootList } = createMockDropdownMenuDefinition( editor );
		const { tree } = menuRootList;

		const tracking = {
			entered: [],
			left: []
		};

		const trackedWalkers = {
			enter: ( { node } ) => {
				tracking.entered.push(
					node.type === 'Root' ? 'Root' : node.search.raw
				);
			},
			leave: ( { node } ) => {
				tracking.left.unshift(
					node.type === 'Root' ? 'Root' : node.search.raw
				);
			}
		};

		walkOverDropdownMenuTreeItems(
			{
				Item: trackedWalkers,
				Default: trackedWalkers
			},
			tree
		);

		expect( tracking.entered ).to.be.deep.equal( [
			'Root', 'Menu 1', 'Foo', 'Bar', 'Buz', 'Menu 2', 'A', 'B'
		] );

		expect( tracking.left ).to.be.deep.equal( [
			'Root', 'Menu 2', 'B', 'A', 'Menu 1', 'Buz', 'Bar', 'Foo'
		] );
	} );

	it( 'should abort walking to children in node if enter returns false', () => {
		const { menuRootList } = createMockDropdownMenuDefinition( editor );
		const { tree } = menuRootList;

		const tracking = {
			entered: [],
			left: []
		};

		const trackedWalkers = {
			enter: ( { node } ) => {
				tracking.entered.push( node.search.raw );

				if ( node.search.raw === 'Menu 2' ) {
					return false;
				}
			},
			leave: ( { node } ) => {
				tracking.left.unshift( node.search.raw );
			}
		};

		walkOverDropdownMenuTreeItems(
			{
				Item: trackedWalkers,
				Menu: trackedWalkers
			},
			tree
		);

		expect( tracking.entered ).to.be.deep.equal( [
			'Menu 1', 'Foo', 'Bar', 'Buz', 'Menu 2'
		] );

		expect( tracking.left ).to.be.deep.equal( [
			'Menu 2', 'Menu 1', 'Buz', 'Bar', 'Foo'
		] );
	} );

	it( 'should raise exception on unknown node', () => {
		expect( () => {
			walkOverDropdownMenuTreeItems(
				{},
				createRootTree( [ {} ] )
			);
		} ).to.throw();
	} );
} );
