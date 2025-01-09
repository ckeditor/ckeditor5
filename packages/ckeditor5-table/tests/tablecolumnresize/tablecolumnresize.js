/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import TableColumnResize from '../../src/tablecolumnresize.js';

describe( 'TableColumnResize', () => {
	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TableColumnResize.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TableColumnResize.isPremiumPlugin ).to.be.false;
	} );
} );
