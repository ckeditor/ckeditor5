/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import diff from '../src/diff';
import diffToChanges from '../src/difftochanges';

describe( 'diffToChanges', () => {
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
		const changes = diffToChanges( diff( input, output ), output );

		changes.forEach( change => {
			if ( change.type == 'insert' ) {
				input.splice( change.index, 0, ...change.values );
			} else if ( change.type == 'delete' ) {
				input.splice( change.index, change.howMany );
			}
		} );

		expect( input ).to.deep.equal( output );
		expect( changes ).to.have.lengthOf( 3 );
	} );

	function test( expectedChangeNumber, oldStr, newStr ) {
		it( `${ oldStr } => ${ newStr }`, () => {
			const changes = diffToChanges( diff( oldStr, newStr ), newStr );
			const oldStrChars = Array.from( oldStr );

			changes.forEach( change => {
				if ( change.type == 'insert' ) {
					oldStrChars.splice( change.index, 0, ...change.values );
				} else if ( change.type == 'delete' ) {
					oldStrChars.splice( change.index, change.howMany );
				}
			} );

			expect( oldStrChars.join( '' ) ).to.equal( newStr );
			expect( changes ).to.have.lengthOf( expectedChangeNumber );
		} );
	}
} );
