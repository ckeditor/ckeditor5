/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * Set of utils to handle unicode characters.
 *
 * @module utils/unicode
 */

/**
 * Checks whether given `character` is a combining mark.
 *
 * @param {String} character Character to check.
 * @returns {Boolean}
 */
export function isCombiningMark( character ) {
	// eslint-disable-next-line no-misleading-character-class
	return !!character && character.length == 1 && /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/.test( character );
}

/**
 * Checks whether given `character` is a high half of surrogate pair.
 *
 * Using UTF-16 terminology, a surrogate pair denotes UTF-16 character using two UTF-8 characters. The surrogate pair
 * consist of high surrogate pair character followed by low surrogate pair character.
 *
 * @param {String} character Character to check.
 * @returns {Boolean}
 */
export function isHighSurrogateHalf( character ) {
	return !!character && character.length == 1 && /[\ud800-\udbff]/.test( character );
}

/**
 * Checks whether given `character` is a low half of surrogate pair.
 *
 * Using UTF-16 terminology, a surrogate pair denotes UTF-16 character using two UTF-8 characters. The surrogate pair
 * consist of high surrogate pair character followed by low surrogate pair character.
 *
 * @param {String} character Character to check.
 * @returns {Boolean}
 */
export function isLowSurrogateHalf( character ) {
	return !!character && character.length == 1 && /[\udc00-\udfff]/.test( character );
}

/**
 * Checks whether given offset in a string is inside a surrogate pair (between two surrogate halves).
 *
 * @param {String} string String to check.
 * @param {Number} offset Offset to check.
 * @returns {Boolean}
 */
export function isInsideSurrogatePair( string, offset ) {
	return isHighSurrogateHalf( string.charAt( offset - 1 ) ) && isLowSurrogateHalf( string.charAt( offset ) );
}

/**
 * Checks whether given offset in a string is between base character and combining mark or between two combining marks.
 *
 * @param {String} string String to check.
 * @param {Number} offset Offset to check.
 * @returns {Boolean}
 */
export function isInsideCombinedSymbol( string, offset ) {
	return isCombiningMark( string.charAt( offset ) );
}

const EMOJI_PATTERN = buildEmojiRegexp();

/**
 * Checks whether given offset in a string is inside multi-character emoji sequence.
 *
 * @param {String} string String to check.
 * @param {Number} offset Offset to check.
 * @returns {Boolean}
 */
export function isInsideEmojiSequence( string, offset ) {
	const matches = String( string ).matchAll( EMOJI_PATTERN );

	return Array.from( matches ).some( match => match.index < offset && offset < match.index + match[ 0 ].length );
}

function buildEmojiRegexp() {
	const parts = [
		// Emoji Tag Sequence (ETS)
		/\p{Emoji}[\u{E0020}-\u{E007E}]+\u{E007F}/u,

		// Emoji Keycap Sequence
		/\p{Emoji}\u{FE0F}?\u{20E3}/u,

		// Emoji Presentation Sequence
		/\p{Emoji}\u{FE0F}/u,

		// Single-Character Emoji / Emoji Modifier Sequence
		/(?=\p{General_Category=Other_Symbol})\p{Emoji}\p{Emoji_Modifier}*/u
	];

	const flagSequence = /\p{Regional_Indicator}{2}/u.source;
	const emoji = '(?:' + parts.map( part => part.source ).join( '|' ) + ')';
	const sequence = `${ flagSequence }|${ emoji }(?:\u{200D}${ emoji })*`;

	return new RegExp( sequence, 'ug' );
}
