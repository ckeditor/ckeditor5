/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';

import { convertCssLengthToPx, isPx, toPx } from '../../src/filters/utils.js';

describe( 'PasteFromOffice - filters - utils', () => {
	describe( 'convertCssLengthToPx()', () => {
		it( 'should convert 10px to px', () => {
			expect( convertCssLengthToPx( '10px' ) ).toBe( '10px' );
		} );

		it( 'should convert 81px to px', () => {
			expect( convertCssLengthToPx( '81px' ) ).toBe( '81px' );
		} );

		it( 'should convert 36pt to px', () => {
			expect( convertCssLengthToPx( '36pt' ) ).toBe( '48px' );
		} );

		it( 'should convert 39.6pt to px', () => {
			expect( convertCssLengthToPx( '39.6pt' ) ).toBe( '53px' );
		} );

		it( 'should convert 5cm to px', () => {
			expect( convertCssLengthToPx( '5cm' ) ).toBe( '189px' );
		} );

		it( 'should convert 2.5cm to px', () => {
			expect( convertCssLengthToPx( '2.5cm' ) ).toBe( '94px' );
		} );

		it( 'should convert 50mm to px', () => {
			expect( convertCssLengthToPx( '50mm' ) ).toBe( '189px' );
		} );

		it( 'should convert 25mm to px', () => {
			expect( convertCssLengthToPx( '25mm' ) ).toBe( '94px' );
		} );

		it( 'should convert 2in to px', () => {
			expect( convertCssLengthToPx( '2in' ) ).toBe( '192px' );
		} );

		it( 'should convert 3.5in to px', () => {
			expect( convertCssLengthToPx( '3.5in' ) ).toBe( '336px' );
		} );

		it( 'should convert 22pc to px', () => {
			expect( convertCssLengthToPx( '22pc' ) ).toBe( '352px' );
		} );

		it( 'should convert 15.5pc to px', () => {
			expect( convertCssLengthToPx( '15.5pc' ) ).toBe( '248px' );
		} );
	} );

	describe( 'isPx()', () => {
		it( 'should return false no parameter', () => {
			expect( isPx() ).toBe( false );
		} );

		it( 'should return false for undefined', () => {
			expect( isPx( undefined ) ).toBe( false );
		} );

		it( 'should return false for unit-less value', () => {
			expect( isPx( '123' ) ).toBe( false );
		} );

		it( 'should return false for pt', () => {
			expect( isPx( '123pt' ) ).toBe( false );
		} );

		it( 'should return true for px', () => {
			expect( isPx( '123px' ) ).toBe( true );
		} );
	} );

	describe( 'toPx()', () => {
		it( 'should append unit', () => {
			expect( toPx( 0 ) ).toBe( '0px' );
			expect( toPx( 1 ) ).toBe( '1px' );
			expect( toPx( 10 ) ).toBe( '10px' );
			expect( toPx( 100 ) ).toBe( '100px' );
			expect( toPx( 123 ) ).toBe( '123px' );
		} );

		it( 'should round to whole px', () => {
			expect( toPx( 1 / 2 ) ).toBe( '1px' );
			expect( toPx( 1 / 3 ) ).toBe( '0px' );
			expect( toPx( 5 / 4 ) ).toBe( '1px' );
			expect( toPx( 5 / 6 ) ).toBe( '1px' );
			expect( toPx( 3.4 ) ).toBe( '3px' );
		} );
	} );
} );
