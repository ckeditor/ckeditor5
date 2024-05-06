/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { dumpDropdownMenuTree } from '../../../../src/dropdown/menu/search/dumpdropdownmenutree.js';
import { Dump } from '../_utils/dropdowntreemenudump.js';
import { createMockDropdownMenuDefinition } from '../_utils/dropdowntreemock.js';

describe( 'dumpDropdownMenuTree', () => {
	it( 'should return a string representation of the tree', () => {
		const { menuRootList } = createMockDropdownMenuDefinition();
		const { tree } = menuRootList;

		const dump = dumpDropdownMenuTree( tree );

		expect( dump ).to.be.equal(
			Dump.root( [
				Dump.menu( 'Menu 1', [
					Dump.item( 'Foo' ),
					Dump.item( 'Bar' ),
					Dump.item( 'Buz' )
				] ),
				Dump.menu( 'Menu 2', [
					Dump.item( 'A' ),
					Dump.item( 'B' )
				] )
			] )
		);
	} );
} );
