/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import {
	isLowSurrogateHalf,
	isHighSurrogateHalf,
	isCombiningMark,
	isInsideSurrogatePair,
	isInsideCombinedSymbol
} from '../src/unicode';

describe( 'utils', () => {
	describe( 'unicode', () => {
		describe( 'isHighSurrogateHalf', () => {
			it( 'should return true if given character is a high surrogate half', () => {
				// '𨭎'.charCodeAt( 0 ); // 55394 --> high surrogate half.
				// '𨭎'.charCodeAt( 1 ); // 57166 --> low surrogate half.
				expect( isHighSurrogateHalf( String.fromCharCode( 55394 ) ) ).to.be.true;
			} );

			it( 'should return false if given character is a low surrogate half', () => {
				// '𨭎'.charCodeAt( 0 ); // 55394 --> high surrogate half.
				// '𨭎'.charCodeAt( 1 ); // 57166 --> low surrogate half.
				expect( isHighSurrogateHalf( String.fromCharCode( 57166 ) ) ).to.be.false;
			} );

			it( 'should return false if given character is not a surrogate half', () => {
				expect( isHighSurrogateHalf( 'a' ) ).to.be.false;
				expect( isHighSurrogateHalf( '𨭎' ) ).to.be.false;
			} );

			it( 'should return false for falsy values', () => {
				expect( isHighSurrogateHalf( null ) ).to.be.false;
				expect( isHighSurrogateHalf( undefined ) ).to.be.false;
				expect( isHighSurrogateHalf( false ) ).to.be.false;
				expect( isHighSurrogateHalf( 0 ) ).to.be.false;
			} );
		} );

		describe( 'isLowSurrogateHalf', () => {
			it( 'should return true if given character is a low surrogate half', () => {
				// '𨭎'.charCodeAt( 0 ); // 55394 --> high surrogate half.
				// '𨭎'.charCodeAt( 1 ); // 57166 --> low surrogate half.
				expect( isLowSurrogateHalf( String.fromCharCode( 57166 ) ) ).to.be.true;
			} );

			it( 'should return false if given character is a high surrogate half', () => {
				// '𨭎'.charCodeAt( 0 ); // 55394 --> high surrogate half.
				// '𨭎'.charCodeAt( 1 ); // 57166 --> low surrogate half.
				expect( isLowSurrogateHalf( String.fromCharCode( 55394 ) ) ).to.be.false;
			} );

			it( 'should return false if given character is not a surrogate half', () => {
				expect( isLowSurrogateHalf( 'a' ) ).to.be.false;
				expect( isLowSurrogateHalf( '𨭎' ) ).to.be.false;
			} );

			it( 'should return false for falsy values', () => {
				expect( isLowSurrogateHalf( null ) ).to.be.false;
				expect( isLowSurrogateHalf( undefined ) ).to.be.false;
				expect( isLowSurrogateHalf( false ) ).to.be.false;
				expect( isLowSurrogateHalf( 0 ) ).to.be.false;
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

			it( 'should return false if given offset is between two surrogate pairs', () => {
				expect( isInsideSurrogatePair( '𨭎𨭎', 2 ) ).to.be.false;
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
