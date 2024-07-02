/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor.js';
import {
	flattenDropdownMenuTree,
	getTotalDropdownMenuTreeFlatItemsCount
} from '../../../../src/dropdown/menu/tree/dropdownmenutreeflattenutils.js';

import { createRootTree, findMenuTreeItemByLabel } from '../_utils/dropdowntreeutils.js';
import {
	createBlankRootListView,
	createMockDropdownMenuDefinition
} from '../_utils/dropdowntreemock.js';

describe( 'flattenDropdownMenuTree', () => {
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

	it( 'should return only root tree if passed empty tree', () => {
		const { tree } = createBlankRootListView( editor );
		const flatten = flattenDropdownMenuTree( tree );

		expect( flatten ).to.deep.equal( [
			{
				parents: [],
				node: tree
			}
		] );
	} );

	it( 'should return flatten list of nodes with parents', () => {
		const { menuRootList: { tree } } = createMockDropdownMenuDefinition( editor );
		const flatten = flattenDropdownMenuTree( tree );

		const byLabel = label => findMenuTreeItemByLabel( label, tree );

		expect( flatten ).to.deep.equal(
			[
				{
					parents: [],
					node: tree
				},
				{
					parents: [ tree ],
					node: byLabel( 'Menu 1' )
				},
				{
					parents: [ tree, byLabel( 'Menu 1' ) ],
					node: byLabel( 'Foo' )
				},
				{
					parents: [ tree, byLabel( 'Menu 1' ) ],
					node: byLabel( 'Bar' )
				},
				{
					parents: [ tree, byLabel( 'Menu 1' ) ],
					node: byLabel( 'Buz' )
				},
				{
					parents: [ tree ],
					node: byLabel( 'Menu 2' )
				},
				{
					parents: [ tree, byLabel( 'Menu 2' ) ],
					node: byLabel( 'A' )
				},
				{
					parents: [ tree, byLabel( 'Menu 2' ) ],
					node: byLabel( 'B' )
				}
			]
		);
	} );
} );

describe( 'getTotalDropdownMenuTreeFlatItemsCount', () => {
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
		const result = getTotalDropdownMenuTreeFlatItemsCount( createRootTree() );

		expect( result ).to.be.equal( 0 );
	} );

	it( 'should return proper flat items count', () => {
		const { menuRootList: { tree } } = createMockDropdownMenuDefinition( editor );
		const result = getTotalDropdownMenuTreeFlatItemsCount( tree );

		expect( result ).to.be.equal( 5 );
	} );
} );
