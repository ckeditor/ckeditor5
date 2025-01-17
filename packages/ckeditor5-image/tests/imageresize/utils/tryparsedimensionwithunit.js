/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { tryParseDimensionWithUnit } from '../../../src/imageresize/utils/tryparsedimensionwithunit.js';

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
