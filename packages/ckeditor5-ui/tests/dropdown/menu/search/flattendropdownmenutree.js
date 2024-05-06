/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { flattenDropdownMenuTree } from '../../../../src/dropdown/menu/search/flattendropdownmenutree.js';

import { findMenuTreeItemByLabel } from '../_utils/dropdowntreeutils.js';
import {
	createBlankRootListView,
	createMockDropdownMenuDefinition
} from '../_utils/dropdowntreemock.js';

describe( 'flattenDropdownMenuTree', () => {
	it( 'should return only root tree if passed empty tree', () => {
		const { menuRootList } = createBlankRootListView();
		const { tree } = menuRootList;
		const flatten = flattenDropdownMenuTree( tree );

		expect( flatten ).to.deep.equal( [
			{
				parents: [],
				node: tree
			}
		] );
	} );

	it( 'should return flatten list of nodes with parents', () => {
		const { menuRootList } = createMockDropdownMenuDefinition();
		const { tree } = menuRootList;
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
