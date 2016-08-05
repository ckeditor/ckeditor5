/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * Set of utils to handle unicode characters.
 *
 * @namespace utils.unicode
 */

/**
 * Checks whether given `character` is a combining mark.
 *
 * @param {String} character Character to check.
 * @returns {Boolean}
 */
export function isCombiningMark( character ) {
	return !!character && character.length == 1 && /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/.test( character );
}

/**
 * Checks whether given `character` is a half of surrogate pair.
 *
 * @param {String} character Character to check.
 * @returns {Boolean}
 */
export function isSurrogateHalf( character ) {
	return !!character && character.length == 1 && /[\ud800-\udfff]/.test( character );
}

/**
 * Checks whether given offset in a string is inside a surrogate pair (between two surrogate halves).
 *
 * @param {String} string String to check.
 * @param {Number} offset Offset to check.
 * @returns {Boolean}
 */
export function isInsideSurrogatePair( string, offset ) {
	const charAfter = string.charAt( offset );
	const charBefore = string.charAt( offset - 1 );

	return isSurrogateHalf( charAfter ) && isSurrogateHalf( charBefore );
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
