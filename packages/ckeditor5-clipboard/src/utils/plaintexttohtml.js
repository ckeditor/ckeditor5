/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module clipboard/utils/plaintexttohtml
 */

/**
 * Converts plain text to its HTML-ized version.
 *
 * @param {String} text The plain text to convert.
 * @returns {String} HTML generated from the plain text.
 */
export default function plainTextToHtml( text ) {
	text = text
		// Encode <>.
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		// Creates a paragraph for each double line break.
		.replace( /\r?\n\r?\n/g, '</p><p>' )
		// Creates a line break for each single line break.
		.replace( /\r?\n/g, '<br>' )
		// Preserve trailing spaces (only the first and last one – the rest is handled below).
		.replace( /^\s/, '&nbsp;' )
		.replace( /\s$/, '&nbsp;' )
		// Preserve other subsequent spaces now.
		.replace( /\s\s/g, ' &nbsp;' );

	if ( text.includes( '</p><p>' ) || text.includes( '<br>' ) ) {
		// If we created paragraphs above, add the trailing ones.
		text = `<p>${ text }</p>`;
	}

	// TODO:
	// * What about '\nfoo' vs ' foo'?

	return text;
}
