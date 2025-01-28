/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Heading from '../src/heading.js';
import HeadingEditing from '../src/headingediting.js';
import HeadingUI from '../src/headingui.js';

describe( 'Heading', () => {
	it( 'should require HeadingEditing and HeadingUI', () => {
		expect( Heading.requires ).to.deep.equal( [ HeadingEditing, HeadingUI ] );
	} );

	it( 'should be named', () => {
		expect( Heading.pluginName ).to.equal( 'Heading' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Heading.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Heading.isPremiumPlugin ).to.be.false;
	} );
} );
