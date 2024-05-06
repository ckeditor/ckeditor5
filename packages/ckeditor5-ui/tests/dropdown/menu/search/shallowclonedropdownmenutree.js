/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { shallowCloneDropdownMenuTree } from '../../../../src/dropdown/menu/search/shallowclonedropdownmenutree.js';
import { createMockDropdownMenuDefinition } from '../_utils/dropdowntreemock.js';

describe( 'shallowCloneDropdownMenuTree', () => {
	it( 'should clone tree with nested children (except views)', () => {
		const { menuRootList } = createMockDropdownMenuDefinition();

		const tree = Object.freeze( menuRootList.tree );
		const clonedTree = shallowCloneDropdownMenuTree( tree );

		clonedTree.children.push( 2 );
		clonedTree.children[ 0 ].children.push( 3 );

		expect( clonedTree ).not.to.be.equal( tree );
		expect( clonedTree.children[ 0 ].menu ).to.be.equal( tree.children[ 0 ].menu );
	} );
} );
