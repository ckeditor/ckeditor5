/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import toUnit from '../../src/dom/tounit';

describe( 'toUnit', () => {
	it( 'should be a function', () => {
		expect( toUnit ).to.be.a( 'function' );
	} );

	it( 'should return a helper function', () => {
		expect( toUnit( 'foo' ) ).to.be.a( 'function' );
	} );

	describe( 'helper function', () => {
		it( 'should always add a trailing unit to the value', () => {
			expect( toUnit( 'px' )( null ) ).to.equal( 'nullpx' );
			expect( toUnit( 'em' )( undefined ) ).to.equal( 'undefinedem' );
			expect( toUnit( 'rem' )( '10' ) ).to.equal( '10rem' );
			expect( toUnit( '' )( 10 ) ).to.equal( '10' );
		} );
	} );
} );
