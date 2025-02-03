/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	isLowSurrogateHalf,
	isHighSurrogateHalf,
	isCombiningMark,
	isInsideSurrogatePair,
	isInsideCombinedSymbol,
	isInsideEmojiSequence
} from '../src/unicode.js';

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

		describe( 'isInsideEmojiSequence', () => {
			const testEmojiSequences = [
				[ '\u{0032}\u{FE0F}\u{20E3}', 'keycap sequence' ],
				[ '\u{1F1E7}\u{1F1EA}', 'tag sequence (Belgium flag)' ],
				[ '\u{1F3F4}\u{E0067}\u{E0062}\u{E0065}\u{E006E}\u{E0067}\u{E007F}', 'tag sequence (England flag)' ],
				[ '1\u{FE0F}', 'digit with emoji presentation selector' ],
				[ '\u{00A9}\u{FE0F}', '(c) with emoji presentation selector' ],
				[ '\u{1F469}\u{1F3FB}\u{200D}\u{1F9B2}', 'woman: light skin tone, bald' ]
			];

			for ( const [ sequence, name ] of testEmojiSequences ) {
				it( `should return true if given offset in a string is inside ${ name }`, () => {
					const testString = `foo${ sequence }bar`;

					expect( isInsideEmojiSequence( testString, 4 ) ).to.be.true;
				} );
			}

			const nonEmoiSequences = [
				[ '123', 'digit sequence' ],
				[ '\u{00A9}\u{FE0E}', '(c) with text presentation selector' ],
				[ 'abc', 'no emoji at all sequence' ]
			];

			for ( const [ sequence, name ] of nonEmoiSequences ) {
				it( `should return false if given offset in a string is inside ${ name }`, () => {
					const testString = `foo${ sequence }bar`;

					expect( isInsideEmojiSequence( testString, 4 ) ).to.be.false;
				} );
			}

			it( 'should return false if given offset in a string is before emoji sequence', () => {
				const testString = 'foo\u{1F1E7}\u{1F1EA}bar';

				expect( isInsideEmojiSequence( testString, 0 ) ).to.be.false;
				expect( isInsideEmojiSequence( testString, 1 ) ).to.be.false;
				expect( isInsideEmojiSequence( testString, 2 ) ).to.be.false;
			} );

			it( 'should return false if given offset in a string is at the first character of emoji sequence', () => {
				const testString = 'foo\u{1F1E7}\u{1F1EA}bar';

				expect( isInsideEmojiSequence( testString, 3 ) ).to.be.false;
			} );

			it( 'should return false if given offset in a string is after emoji sequence', () => {
				const testString = 'foo\u{1F1E7}\u{1F1EA}bar';

				expect( isInsideEmojiSequence( testString, 7 ) ).to.be.false;
				expect( isInsideEmojiSequence( testString, 8 ) ).to.be.false;
				expect( isInsideEmojiSequence( testString, 9 ) ).to.be.false;
			} );

			it( 'should return true if given offset in a string is at any character in emoji sequence except the first one', () => {
				const testString = 'foo\u{1F1E7}\u{1F1EA}bar';

				expect( isInsideEmojiSequence( testString, 4 ) ).to.be.true;
				expect( isInsideEmojiSequence( testString, 5 ) ).to.be.true;
				expect( isInsideEmojiSequence( testString, 6 ) ).to.be.true;
			} );

			it( 'should return false if a string is empty', () => {
				expect( isInsideEmojiSequence( '', 0 ) ).to.be.false;
			} );

			it( 'should properly detect multiple emojis in the same string', () => {
				const firstEmoji = '\u{0032}\u{FE0F}\u{20E3}';
				const secondEmoji = '\u{1F469}\u{1F3FB}\u{200D}\u{1F9B2}';
				const testString = `foo${ firstEmoji }bar${ secondEmoji }}baz`;
				const firstEmojiOffset = 'foo'.length;
				const secondEmojiOffset = `foo${ firstEmoji }bar`.length;

				for ( let i = 0; i < testString.length - 1; i++ ) {
					const isInsideFirstEmoji = i > firstEmojiOffset && i < firstEmojiOffset + firstEmoji.length;
					const isInsideSecondEmoji = i > secondEmojiOffset && i < secondEmojiOffset + secondEmoji.length;

					expect( isInsideEmojiSequence( testString, i ) ).to.equal( isInsideFirstEmoji || isInsideSecondEmoji );
				}
			} );
		} );
	} );
} );
