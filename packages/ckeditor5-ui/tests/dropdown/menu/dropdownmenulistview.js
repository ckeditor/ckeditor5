/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ListView, DropdownMenuListView } from '../../../src/index.js';

import { createMockLocale } from './_utils/dropdowntreemock.js';

describe( 'DropdownMenuListView', () => {
	let listView, locale;

	beforeEach( async () => {
		locale = createMockLocale();
		listView = new DropdownMenuListView( locale );
	} );

	afterEach( async () => {
		listView.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should inherit from ListView', () => {
			expect( listView ).to.be.instanceOf( ListView );
		} );

		it( 'should have #role set', () => {
			expect( listView.role ).to.equal( 'menu' );
		} );
	} );
} );
