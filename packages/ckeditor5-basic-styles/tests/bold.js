/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Bold from '../src/bold.js';
import BoldEditing from '../src/bold/boldediting.js';
import BoldUI from '../src/bold/boldui.js';

describe( 'Bold', () => {
	it( 'should require BoldEditing and BoldUI', () => {
		expect( Bold.requires ).to.deep.equal( [ BoldEditing, BoldUI ] );
	} );

	it( 'should be named', () => {
		expect( Bold.pluginName ).to.equal( 'Bold' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Bold.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Bold.isPremiumPlugin ).to.be.false;
	} );
} );
