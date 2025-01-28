/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Italic from '../src/italic.js';
import ItalicEditing from '../src/italic/italicediting.js';
import ItalicUI from '../src/italic/italicui.js';

describe( 'Italic', () => {
	it( 'should require ItalicEditing and ItalicUI', () => {
		expect( Italic.requires ).to.deep.equal( [ ItalicEditing, ItalicUI ] );
	} );

	it( 'should be named', () => {
		expect( Italic.pluginName ).to.equal( 'Italic' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Italic.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Italic.isPremiumPlugin ).to.be.false;
	} );
} );
