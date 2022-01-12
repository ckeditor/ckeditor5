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
