/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Underline from '../src/underline.js';
import UnderlineEditing from '../src/underline/underlineediting.js';
import UnderlineUI from '../src/underline/underlineui.js';

describe( 'Underline', () => {
	it( 'should require UnderlineEditing and UnderlineUI', () => {
		expect( Underline.requires ).to.deep.equal( [ UnderlineEditing, UnderlineUI ] );
	} );

	it( 'should be named', () => {
		expect( Underline.pluginName ).to.equal( 'Underline' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Underline.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Underline.isPremiumPlugin ).to.be.false;
	} );
} );
