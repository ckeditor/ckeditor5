/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { tryParseDimensionWithUnit, tryCastDimensionsToUnit } from '../src/parsedimensionwithunit.js';

describe( 'tryParseDimensionWithUnit', () => {
	it( 'should parse value with pixels', () => {
		expect( tryParseDimensionWithUnit( '22px' ) ).to.deep.equal( {
			value: 22,
			unit: 'px'
		} );
	} );

	it( 'should parse value with percentage', () => {
		expect( tryParseDimensionWithUnit( '22%' ) ).to.deep.equal( {
			value: 22,
			unit: '%'
		} );
	} );

	it( 'should parse floating point values', () => {
		expect( tryParseDimensionWithUnit( '22.54%' ) ).to.deep.equal( {
			value: 22.54,
			unit: '%'
		} );
	} );

	it( 'should handle blank values', () => {
		expect( tryParseDimensionWithUnit( null ) ).to.be.null;
		expect( tryParseDimensionWithUnit( undefined ) ).to.be.null;
	} );

	it( 'should handle malformed numeric value', () => {
		expect( tryParseDimensionWithUnit( 'foo bar' ) ).to.be.null;
	} );

	it( 'should handle unknown units', () => {
		expect( tryParseDimensionWithUnit( '1234in' ) ).to.be.null;
	} );
} );

describe( 'tryCastDimensionsToUnit', () => {
	it( 'should return px dimension unchanged when target unit is px', () => {
		expect( tryCastDimensionsToUnit( 800, { value: 200, unit: 'px' }, 'px' ) ).to.deep.equal( {
			value: 200,
			unit: 'px'
		} );
	} );

	it( 'should convert px to % when target unit is %', () => {
		expect( tryCastDimensionsToUnit( 800, { value: 200, unit: 'px' }, '%' ) ).to.deep.equal( {
			value: 25,
			unit: '%'
		} );
	} );

	it( 'should handle floating point conversion', () => {
		const result = tryCastDimensionsToUnit( 1000, { value: 250, unit: 'px' }, '%' );

		expect( result.unit ).to.equal( '%' );
		expect( result.value ).to.equal( 25 );
	} );
} );
