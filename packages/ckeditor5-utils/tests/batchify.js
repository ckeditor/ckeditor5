/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import diff from '/ckeditor5/utils/diff.js';
import batchify from '/ckeditor5/utils/batchify.js';

describe( 'batchify', () => {
	describe( 'equal patterns', () => {
		test( 0,		'',				'' );
		test( 0,		'abc',			'abc' );
	} );

	describe( 'insertion', () => {
		test( 1,		'',				'abc' );
		test( 1,		'abc',			'abcd' );
		test( 1,		'abc',			'abcdef' );
		test( 2,		'abc',			'xxabcyy' );
		test( 2,		'abc',			'axxbyyc' );
	} );

	describe( 'deletion', () => {
		test( 1,		'abc',			'' );
		test( 1,		'abc',			'ac' );
		test( 1,		'abc',			'bc' );
		test( 1,		'abc',			'ab' );
		test( 1,		'abc',			'c' );
		test( 2,		'abc',			'b' );
	} );

	describe( 'replacement', () => {
		test( 2,		'abc',			'def' );
		test( 2,		'abc',			'axc' );
		test( 2,		'abc',			'axyc' );
		test( 2,		'abc',			'xybc' );
		test( 2,		'abc',			'abxy' );
	} );

	describe( 'various', () => {
		test( 3,		'abc',			'xbccy' );
		test( 2,		'abcdef',		'defabc' );
		test( 4,		'abcdef',		'axxdeyyfz' );
		test( 4,		'abcdef',		'xybzc' );
		test( 5,		'abcdef',		'bdxfy' );
	} );

	it( 'works with arrays', () => {
		const input = Array.from( 'abc' );
		const output = Array.from( 'xaby' );
		const batch = batchify( diff( input, output ), output );

		batch.forEach( operation => {
			if ( operation.type == 'INSERT' ) {
				input.splice( operation.index, 0, ...operation.values );
			} else if ( operation.type == 'DELETE' ) {
				input.splice( operation.index, operation.howMany );
			}
		} );

		expect( input ).to.deep.equal( output );
		expect( batch ).to.have.lengthOf( 3 );
	} );

	function test( expectedOperationNumber, oldStr, newStr ) {
		it( `${ oldStr } => ${ newStr }`, () => {
			const batch = batchify( diff( oldStr, newStr ), newStr );
			const oldStrChars = Array.from( oldStr );

			batch.forEach( operation => {
				if ( operation.type == 'INSERT' ) {
					oldStrChars.splice( operation.index, 0, ...operation.values );
				} else if ( operation.type == 'DELETE' ) {
					oldStrChars.splice( operation.index, operation.howMany );
				}
			} );

			expect( oldStrChars.join( '' ) ).to.equal( newStr );
			expect( batch ).to.have.lengthOf( expectedOperationNumber );
		} );
	}
} );
