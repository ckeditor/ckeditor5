/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import { isSurrogateHalf, isCombiningMark, isInsideSurrogatePair, isInsideCombinedSymbol } from '/ckeditor5/utils/unicode.js';

describe( 'utils', () => {
	describe( 'unicode', () => {
		describe( 'isSurrogateHalf', () => {
			it( 'should return true if given character is a surrogate half', () => {
				// Half of pile of poo - U+D83D
				// It is not string because of problem with Babel replacing half of the surrogate with actual (wrong) character.
				expect( isSurrogateHalf( String.fromCharCode( 0xD83D ) ) ).to.be.true;
			} );

			it( 'should return false if given character is not a surrogate half', () => {
				expect( isSurrogateHalf( 'a' ) ).to.be.false;
				expect( isSurrogateHalf( '𨭎' ) ).to.be.false;
			} );

			it( 'should return false for falsy values', () => {
				expect( isSurrogateHalf( null ) ).to.be.false;
				expect( isSurrogateHalf( undefined ) ).to.be.false;
				expect( isSurrogateHalf( false ) ).to.be.false;
				expect( isSurrogateHalf( 0 ) ).to.be.false;
			} );
		} );

		describe( 'isCombiningMark', () => {
			it( 'should return true if given character is a combining mark', () => {
				expect( isCombiningMark( '̣' ) ).to.be.true;
			} );

			it( 'should return false if given character is not a combining mark', () => {
				expect( isCombiningMark( 'a' ) ).to.be.false;
				expect( isCombiningMark( 'q̣' ) ).to.be.false;
			} );

			it( 'should return false for falsy values', () => {
				expect( isCombiningMark( null ) ).to.be.false;
				expect( isCombiningMark( undefined ) ).to.be.false;
				expect( isCombiningMark( false ) ).to.be.false;
				expect( isCombiningMark( 0 ) ).to.be.false;
			} );
		} );

		describe( 'isInsideSurrogatePair', () => {
			const testString = 'a𨭎b';

			it( 'should return true if given offset in a string is inside a surrogate pair', () => {
				expect( isInsideSurrogatePair( testString, 2 ) ).to.be.true;
			} );

			it( 'should return false if given offset in a string is not inside a surrogate pair', () => {
				expect( isInsideSurrogatePair( testString, 1 ) ).to.be.false;
				expect( isInsideSurrogatePair( testString, 3 ) ).to.be.false;
			} );

			it( 'should return false if given offset in a string is at the string beginning or end', () => {
				expect( isInsideSurrogatePair( testString, 0 ) ).to.be.false;
				expect( isInsideSurrogatePair( testString, 4 ) ).to.be.false;
			} );
		} );

		describe( 'isInsideCombinedSymbol', () => {
			const testString = 'aa̻̐ͩbb';

			it( 'should return true if given offset in a string is inside a symbol with combining mark', () => {
				expect( isInsideCombinedSymbol( testString, 2 ) ).to.be.true;
				expect( isInsideCombinedSymbol( testString, 3 ) ).to.be.true;
				expect( isInsideCombinedSymbol( testString, 4 ) ).to.be.true;
			} );

			it( 'should return false if given offset in a string is not inside a symbol with combining mark', () => {
				expect( isInsideCombinedSymbol( testString, 1 ) ).to.be.false;
				expect( isInsideCombinedSymbol( testString, 5 ) ).to.be.false;
			} );

			it( 'should return false if given offset in a string is at the string beginning or end', () => {
				expect( isInsideCombinedSymbol( testString, 0 ) ).to.be.false;
				expect( isInsideCombinedSymbol( testString, 6 ) ).to.be.false;
			} );
		} );
	} );
} );
