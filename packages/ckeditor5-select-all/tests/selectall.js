/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import SelectAll from '../src/selectall.js';
import SelectAllEditing from '../src/selectallediting.js';
import SelectAllUI from '../src/selectallui.js';

describe( 'SelectAll', () => {
	it( 'should require SelectAllEditing and SelectAllUI', () => {
		expect( SelectAll.requires ).to.deep.equal( [ SelectAllEditing, SelectAllUI ] );
	} );

	it( 'should be named', () => {
		expect( SelectAll.pluginName ).to.equal( 'SelectAll' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( SelectAll.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( SelectAll.isPremiumPlugin ).to.be.false;
	} );
} );
