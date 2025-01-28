/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module clipboard/utils/plaintexttohtml
 */

/**
 * Converts plain text to its HTML-ized version.
 *
 * @param text The plain text to convert.
 * @returns HTML generated from the plain text.
 */
export default function plainTextToHtml( text: string ): string {
	text = text
		// Encode &.
		.replace( /&/g, '&amp;' )
		// Encode <>.
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' )
		// Creates a paragraph for each double line break.
		.replace( /\r?\n\r?\n/g, '</p><p>' )
		// Creates a line break for each single line break.
		.replace( /\r?\n/g, '<br>' )
		// Replace tabs with four spaces.
		.replace( /\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;' )
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
