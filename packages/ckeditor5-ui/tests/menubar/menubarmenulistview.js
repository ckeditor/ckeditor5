/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Locale } from '@ckeditor/ckeditor5-utils';
import { ListView, MenuBarMenuListView } from '../../src/index.js';

describe( 'MenuBarMenuListView', () => {
	let listView, locale;

	beforeEach( () => {
		locale = new Locale();
		listView = new MenuBarMenuListView( locale );
	} );

	afterEach( () => {
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
