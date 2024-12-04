/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Superscript from '../src/superscript.js';
import SuperEditing from '../src/superscript/superscriptediting.js';
import SuperUI from '../src/superscript/superscriptui.js';

describe( 'Superscript', () => {
	it( 'should require SuperEditing and SuperUI', () => {
		expect( Superscript.requires ).to.deep.equal( [ SuperEditing, SuperUI ] );
	} );

	it( 'should be named', () => {
		expect( Superscript.pluginName ).to.equal( 'Superscript' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Superscript.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Superscript.isPremiumPlugin ).to.be.false;
	} );
} );
