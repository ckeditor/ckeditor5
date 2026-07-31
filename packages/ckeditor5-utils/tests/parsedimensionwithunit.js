/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { tryParseDimensionWithUnit, tryCastDimensionsToUnit } from '../src/parsedimensionwithunit.js';

describe( 'tryParseDimensionWithUnit', () => {
	it( 'should parse value with pixels', () => {
		expect( tryParseDimensionWithUnit( '22px' ) ).toEqual( {
			value: 22,
			unit: 'px'
		} );
	} );

	it( 'should parse value with percentage', () => {
		expect( tryParseDimensionWithUnit( '22%' ) ).toEqual( {
			value: 22,
			unit: '%'
		} );
	} );

	it( 'should parse floating point values', () => {
		expect( tryParseDimensionWithUnit( '22.54%' ) ).toEqual( {
			value: 22.54,
			unit: '%'
		} );
	} );

	it( 'should handle blank values', () => {
		expect( tryParseDimensionWithUnit( null ) ).toBeNull();
		expect( tryParseDimensionWithUnit( undefined ) ).toBeNull();
	} );

	it( 'should handle malformed numeric value', () => {
		expect( tryParseDimensionWithUnit( 'foo bar' ) ).toBeNull();
	} );

	it( 'should handle unknown units', () => {
		expect( tryParseDimensionWithUnit( '1234in' ) ).toBeNull();
	} );
} );

describe( 'tryCastDimensionsToUnit', () => {
	it( 'should return px dimension unchanged when target unit is px', () => {
		expect( tryCastDimensionsToUnit( 800, { value: 200, unit: 'px' }, 'px' ) ).toEqual( {
			value: 200,
			unit: 'px'
		} );
	} );

	it( 'should convert px to % when target unit is %', () => {
		expect( tryCastDimensionsToUnit( 800, { value: 200, unit: 'px' }, '%' ) ).toEqual( {
			value: 25,
			unit: '%'
		} );
	} );

	it( 'should handle floating point conversion', () => {
		const result = tryCastDimensionsToUnit( 1000, { value: 250, unit: 'px' }, '%' );

		expect( result.unit ).toEqual( '%' );
		expect( result.value ).toEqual( 25 );
	} );
} );
