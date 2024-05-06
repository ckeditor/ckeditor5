/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	getTotalDropdownMenuTreeFlatItemsCount
} from '../../../../src/dropdown/menu/search/gettotaldropdownmenutreeflatitemscount.js';

import { createMockDropdownMenuDefinition } from '../_utils/dropdowntreemock.js';
import { createRootTree } from '../_utils/dropdowntreeutils.js';

describe( 'getTotalDropdownMenuTreeFlatItemsCount', () => {
	it( 'should return 0 results if passed empty tree', () => {
		const result = getTotalDropdownMenuTreeFlatItemsCount( createRootTree() );

		expect( result ).to.be.equal( 0 );
	} );

	it( 'should return proper flat items count', () => {
		const { menuRootList } = createMockDropdownMenuDefinition();
		const { tree } = menuRootList;
		const result = getTotalDropdownMenuTreeFlatItemsCount( tree );

		expect( result ).to.be.equal( 5 );
	} );
} );
