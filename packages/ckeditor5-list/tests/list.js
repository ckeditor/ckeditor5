/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import List from '../src/list.js';
import ListUI from '../src/list/listui.js';
import ListEditing from '../src/list/listediting.js';

describe( 'List', () => {
	it( 'should be named', () => {
		expect( List.pluginName ).to.equal( 'List' );
	} );

	it( 'should require ListEditing and ListUI', () => {
		expect( List.requires ).to.deep.equal( [ ListEditing, ListUI ] );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( List.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( List.isPremiumPlugin ).to.be.false;
	} );
} );
