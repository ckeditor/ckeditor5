/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Link from '../src/link.js';
import AutoLink from '../src/autolink.js';
import LinkEditing from '../src/linkediting.js';
import LinkUI from '../src/linkui.js';

describe( 'Link', () => {
	it( 'should require LinkEditing, LinkUI and AutoLink', () => {
		expect( Link.requires ).to.deep.equal( [ LinkEditing, LinkUI, AutoLink ] );
	} );

	it( 'should be named', () => {
		expect( Link.pluginName ).to.equal( 'Link' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Link.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Link.isPremiumPlugin ).to.be.false;
	} );
} );
