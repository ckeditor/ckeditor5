/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import FontBackgroundColor from './../src/fontbackgroundcolor.js';
import FontBackgroundColorEditing from './../src/fontbackgroundcolor/fontbackgroundcolorediting.js';
import FontBackgroundColorUI from '../src/fontbackgroundcolor/fontbackgroundcolorui.js';

describe( 'FontBackgroundColor', () => {
	it( 'requires FontBackgroundColorEditing and FontBackgroundColorUI', () => {
		expect( FontBackgroundColor.requires ).to.deep.equal( [ FontBackgroundColorEditing, FontBackgroundColorUI ] );
	} );

	it( 'defines plugin name', () => {
		expect( FontBackgroundColor.pluginName ).to.equal( 'FontBackgroundColor' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( FontBackgroundColor.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( FontBackgroundColor.isPremiumPlugin ).to.be.false;
	} );
} );
