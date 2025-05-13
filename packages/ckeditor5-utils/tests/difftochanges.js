/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import diff from '../src/diff.js';
import diffToChanges from '../src/difftochanges.js';

describe( 'diffToChanges', () => {
	/* eslint-disable @stylistic/no-multi-spaces */

	describe( 'equal patterns', () => {
		testDiff( 0,		'',				'' );
		testDiff( 0,		'abc',			'abc' );
	} );

	describe( 'insertion', () => {
		testDiff( 1,		'',				'abc' );
		testDiff( 1,		'abc',			'abcd' );
		testDiff( 1,		'abc',			'abcdef' );
		testDiff( 2,		'abc',			'xxabcyy' );
		testDiff( 2,		'abc',			'axxbyyc' );
	} );

	describe( 'deletion', () => {
		testDiff( 1,		'abc',			'' );
		testDiff( 1,		'abc',			'ac' );
		testDiff( 1,		'abc',			'bc' );
		testDiff( 1,		'abc',			'ab' );
		testDiff( 1,		'abc',			'c' );
		testDiff( 2,		'abc',			'b' );
	} );

	describe( 'replacement', () => {
		testDiff( 2,		'abc',			'def' );
		testDiff( 2,		'abc',			'axc' );
		testDiff( 2,		'abc',			'axyc' );
		testDiff( 2,		'abc',			'xybc' );
		testDiff( 2,		'abc',			'abxy' );
	} );

	describe( 'various', () => {
		testDiff( 3,		'abc',			'xbccy' );
		testDiff( 2,		'abcdef',		'defabc' );
		testDiff( 4,		'abcdef',		'axxdeyyfz' );
		testDiff( 4,		'abcdef',		'xybzc' );
		testDiff( 5,		'abcdef',		'bdxfy' );
	} );

	/* eslint-enable @stylistic/no-multi-spaces */

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

	function testDiff( expectedChangeNumber, oldStr, newStr ) {
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
