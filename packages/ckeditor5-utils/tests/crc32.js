/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import crc32 from '../src/crc32.js';

describe( 'crc32', () => {
	describe( 'input is a single value (not an array)', () => {
		it( 'should correctly calculate the CRC32 checksum for a string', () => {
			const input = 'foo';
			const expectedHex = '8c736521';
			expect( crc32( input ) ).to.equal( expectedHex );
		} );

		it( 'should correctly calculate the CRC32 checksum for a number', () => {
			const input = 123;
			const expectedHex = '884863d2';
			expect( crc32( input ) ).to.equal( expectedHex );
		} );

		it( 'should correctly calculate the CRC32 checksum for a boolean', () => {
			const input = true;
			const expectedHex = 'fdfc4c8d';
			expect( crc32( input ) ).to.equal( expectedHex );
		} );

		it( 'should correctly calculate the CRC32 checksum for an empty string', () => {
			const input = '';
			const expectedHex = '00000000';
			expect( crc32( input ) ).to.equal( expectedHex );
		} );
	} );

	describe( 'input is an array', () => {
		it( 'should correctly calculate the CRC32 checksum for a string', () => {
			const input = [ 'foo' ];
			const expectedHex = '8c736521';
			expect( crc32( input ) ).to.equal( expectedHex );
		} );

		it( 'should correctly calculate the CRC32 checksum for a number', () => {
			const input = [ 123 ];
			const expectedHex = '884863d2';
			expect( crc32( input ) ).to.equal( expectedHex );
		} );

		it( 'should correctly calculate the CRC32 checksum for a boolean', () => {
			const input = [ true ];
			const expectedHex = 'fdfc4c8d';
			expect( crc32( input ) ).to.equal( expectedHex );
		} );

		it( 'should correctly calculate the CRC32 checksum for a table of strings', () => {
			const input = [ 'foo', 'bar', 'baz' ];
			const expectedHex = '1a7827aa';
			expect( crc32( input ) ).to.equal( expectedHex );
		} );

		it( 'should handle mixed data types and compute a valid CRC32 checksum', () => {
			const input = [ 'foo', 123, false, [ 'bar', 'baz' ] ];
			const expectedHex = 'ee1795af';
			expect( crc32( input ) ).to.equal( expectedHex );
		} );

		it( 'should correctly handle an empty array', () => {
			const input = [];
			const expectedHex = '00000000';
			expect( crc32( input ) ).to.equal( expectedHex );
		} );

		it( 'should correctly handle arrays containing empty strings', () => {
			const input = [ '', '', '' ];
			const expectedHex = '00000000';
			expect( crc32( input ) ).to.equal( expectedHex );
		} );
	} );

	describe( 'return values', () => {
		it( 'should return a hexadecimal string when returnHex is true', () => {
			const input = [ 'foo' ];
			const result = '8c736521';
			expect( crc32( input ) ).to.equal( result );
		} );

		it( 'should return a hexadecimal string when returnHex is not set', () => {
			const input = [ 'foo' ];
			const result = '8c736521';
			expect( crc32( input ) ).to.equal( result );
		} );

		it( 'should return consistent results for the same input', () => {
			const input = [ 'foo', 'bar' ];
			const firstRun = crc32( input );
			const secondRun = crc32( input );
			expect( firstRun ).to.equal( secondRun );
		} );
	} );
} );
