/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { convertCssLengthToPx, isPx, toPx } from '../../src/filters/utils.js';

describe( 'PasteFromOffice - filters - utils', () => {
	describe( 'convertCssLengthToPx()', () => {
		it( 'should convert 10px to px', () => {
			expect( convertCssLengthToPx( '10px' ) ).to.equal( '10px' );
		} );

		it( 'should convert 81px to px', () => {
			expect( convertCssLengthToPx( '81px' ) ).to.equal( '81px' );
		} );

		it( 'should convert 36pt to px', () => {
			expect( convertCssLengthToPx( '36pt' ) ).to.equal( '48px' );
		} );

		it( 'should convert 39.6pt to px', () => {
			expect( convertCssLengthToPx( '39.6pt' ) ).to.equal( '53px' );
		} );

		it( 'should convert 5cm to px', () => {
			expect( convertCssLengthToPx( '5cm' ) ).to.equal( '189px' );
		} );

		it( 'should convert 2.5cm to px', () => {
			expect( convertCssLengthToPx( '2.5cm' ) ).to.equal( '94px' );
		} );

		it( 'should convert 50mm to px', () => {
			expect( convertCssLengthToPx( '50mm' ) ).to.equal( '189px' );
		} );

		it( 'should convert 25mm to px', () => {
			expect( convertCssLengthToPx( '25mm' ) ).to.equal( '94px' );
		} );

		it( 'should convert 2in to px', () => {
			expect( convertCssLengthToPx( '2in' ) ).to.equal( '192px' );
		} );

		it( 'should convert 3.5in to px', () => {
			expect( convertCssLengthToPx( '3.5in' ) ).to.equal( '336px' );
		} );

		it( 'should convert 22pc to px', () => {
			expect( convertCssLengthToPx( '22pc' ) ).to.equal( '352px' );
		} );

		it( 'should convert 15.5pc to px', () => {
			expect( convertCssLengthToPx( '15.5pc' ) ).to.equal( '248px' );
		} );
	} );

	describe( 'isPx()', () => {
		it( 'should return false no parameter', () => {
			expect( isPx() ).to.be.false;
		} );

		it( 'should return false for undefined', () => {
			expect( isPx( undefined ) ).to.be.false;
		} );

		it( 'should return false for unit-less value', () => {
			expect( isPx( '123' ) ).to.be.false;
		} );

		it( 'should return false for pt', () => {
			expect( isPx( '123pt' ) ).to.be.false;
		} );

		it( 'should return true for px', () => {
			expect( isPx( '123px' ) ).to.be.true;
		} );
	} );

	describe( 'toPx()', () => {
		it( 'should append unit', () => {
			expect( toPx( 0 ) ).to.equal( '0px' );
			expect( toPx( 1 ) ).to.equal( '1px' );
			expect( toPx( 10 ) ).to.equal( '10px' );
			expect( toPx( 100 ) ).to.equal( '100px' );
			expect( toPx( 123 ) ).to.equal( '123px' );
		} );

		it( 'should round to whole px', () => {
			expect( toPx( 1 / 2 ) ).to.equal( '1px' );
			expect( toPx( 1 / 3 ) ).to.equal( '0px' );
			expect( toPx( 5 / 4 ) ).to.equal( '1px' );
			expect( toPx( 5 / 6 ) ).to.equal( '1px' );
			expect( toPx( 3.4 ) ).to.equal( '3px' );
		} );
	} );
} );
