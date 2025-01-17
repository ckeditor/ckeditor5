/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import longtext from './longtext.txt';

/**
 * Returns text of a given length.
 *
 * @param {Number} length Length of the resulting text.
 * @param {Boolean} fromStart Whether text should be extracted from the start (or end) of the template string.
 * @param {Boolean} reversed Whether given text should be reversed.
 * @returns {String} Text of a given length.
 */
export default function getLongText( length, fromStart = true, reversed = false ) {
	const baseText = longtext.repeat( Math.ceil( length / longtext.length ) );
	const text = fromStart ? baseText.substring( 0, length ) : baseText.substring( longtext.length - length );
	return reversed ? text.split( '' ).reverse().join( '' ) : text;
}
