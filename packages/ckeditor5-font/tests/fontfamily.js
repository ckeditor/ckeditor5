/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import FontFamily from './../src/fontfamily.js';
import FontFamilyEditing from './../src/fontfamily/fontfamilyediting.js';
import FontFamilyUI from '../src/fontfamily/fontfamilyui.js';

describe( 'FontFamily', () => {
	it( 'requires FontFamilyEditing and FontFamilyUI', () => {
		expect( FontFamily.requires ).to.deep.equal( [ FontFamilyEditing, FontFamilyUI ] );
	} );

	it( 'defines plugin name', () => {
		expect( FontFamily.pluginName ).to.equal( 'FontFamily' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FontFamily.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( FontFamily.isPremiumPlugin ).to.be.false;
	} );
} );
