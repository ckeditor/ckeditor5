/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Strikethrough from '../src/strikethrough.js';
import StrikethroughEditing from '../src/strikethrough/strikethroughediting.js';
import StrikethroughUI from '../src/strikethrough/strikethroughui.js';

describe( 'Strikethrough', () => {
	it( 'should require StrikethroughEditing and StrikethroughUI', () => {
		expect( Strikethrough.requires ).to.deep.equal( [ StrikethroughEditing, StrikethroughUI ] );
	} );

	it( 'should be named', () => {
		expect( Strikethrough.pluginName ).to.equal( 'Strikethrough' );
	} );

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( Strikethrough.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( Strikethrough.isPremiumPlugin ).to.be.false;
	} );
} );
