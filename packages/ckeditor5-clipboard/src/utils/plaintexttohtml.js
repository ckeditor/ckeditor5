/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
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
		// Creates paragraphs for double line breaks and change single line breaks to <br>s.
		.replace( /\n\n/g, '</p><p>' )
		.replace( /\n/g, '<br>' )
		// Preserve trailing spaces (only the first and last one – the rest is handled below).
		.replace( /^\s/, '&nbsp;' )
		.replace( /\s$/, '&nbsp;' )
		// Preserve other subsequent spaces now.
		.replace( /\s\s/g, ' &nbsp;' );

	if ( text.indexOf( '</p><p>' ) > -1 ) {
		// If we created paragraphs above, add the trailing ones.
		text = `<p>${ text }</p>`;
	}

	// TODO:
	// * What about '\nfoo' vs ' foo'?

	return text;
}
