/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/insertgoogledocsfootnotes
 */

import type { ViewDocumentFragment, ViewUpcastWriter } from 'ckeditor5/src/engine.js';

/**
 * Inserts Google Docs specific footnotes references and definitions into the document fragment.
 *
 * Things to know about Google Docs footnotes:
 *
 * * Footnote references in Google Docs are marked with `#` character within `dsl_spacers` string in the clipboard data.
 * * The `#` character that represents footnote reference in `dsl_spacers` is not present in the actual text content.
 * * From time to time the white spaces characters are added to `dsl_spacers` to indicate spacing between elements.
 */
export function insertGoogleDocsFootnotes(
	documentFragment: ViewDocumentFragment,
	writer: ViewUpcastWriter,
	slice: GoogleDocsClipboardDocumentSliceData
): void {
	// DSL spacers use certain characters as mask to define where certain elements are located within the document slice.
	// The '#' character is used to mark the position of footnotes references. However, the `#` character might be also
	// used as a normal character within the text. At this stage just check if the `#` character is present within the spacers.
	// If not, there's no need to proceed with footnotes processing.
	if ( !slice.dsl_spacers.includes( '#' ) ) {
		return;
	}

	// If there are no footnotes feature exported from g-docs, there's nothing to process. It's highly unlikely.
	// `dsl_spacers` mappings for footnotes used to be defined in the first style slice of type `footnote`.
	const footnotesSliceStyle = slice.dsl_styleslices.find( styleSlice => styleSlice.stsl_type === 'footnote' );

	if ( !footnotesSliceStyle ) {
		return;
	}

	let data = '';

	// Google Docs use some whitespaces within the `dsl_spacers` string to indicate regions where elements start or end.
	// It applies to tables, lists, etc. However, footnotes references are always marked with `#` character, without any whitespaces.
	// To keep the processing simple, remove all whitespaces from the `dsl_spacers` string.
	const template = dropWhitespaces( slice.dsl_spacers );
	let templateMismatch = false;

	for ( const { item } of writer.createRangeIn( documentFragment ) ) {
		if ( !item.is( '$textProxy' ) ) {
			continue;
		}

		for ( let i = 0; i < item.data.length; i++ ) {
			const char = item.data[ i ];

			// Similarly to `dsl_spacers`, ignore whitespaces within the text content.
			if ( isWhitespace( char ) ) {
				continue;
			}

			// If it's normal character, but on the same position in the spacers there's footnote spacer, add the spacer first.
			// This way we keep our data aligned with the spacers structure.
			if ( char !== '#' && template[ data.length ] === '#' ) {
				data += '#' + char;
				continue;
			}

			data += char;

			// Something is wrong with the data or the template, they are not aligned. Stop processing.
			// Let's analyze what we collected so far.
			if ( char !== template[ data.length - 1 ] ) {
				templateMismatch = true;
				break;
			}
		}
	}

	// If we processed all text, but there's still some template left, it means that the rest of the template
	// contains only footnote spacers. Add them all.
	if ( !templateMismatch && data.length < template.length ) {
		for ( let i = data.length; i < template.length; i++ ) {
			if ( template[ i ] === '#' ) {
				data += '#';
			} else {
				// If there's some other character, something is wrong with the data or the template, they are not aligned. Stop processing.
				templateMismatch = true;
				break;
			}
		}
	}

	// If there's some mismatch between the data and the template, do not proceed with footnotes processing.
	// It means that the data or the template are corrupted in some way.
	// This is highly unlikely, but better be safe than place a footnote reference somewhere it does not belong.
	if ( templateMismatch ) {
		return;
	}

	console.info( JSON.stringify( data ), JSON.stringify( template ), data === template );
}

/**
 * Checks whether the given character is a whitespace.
 *
 * @param char Character to check.
 * @returns `true` if the character is a whitespace, `false` otherwise.
 */
function isWhitespace( char: string ): boolean {
	return /\s/.test( char );
}

/** Removes all whitespaces from the given string.
 *
 * @param str String to process.
 * @returns String without whitespaces.
 */
function dropWhitespaces( str: string ): string {
	return str.replace( /\s+/g, '' );
}

/**
 * Simplified type describing the structure of the `application/x-vnd.google-docs-document-slice-clip+wrapped`.
 */
export type GoogleDocsClipboardDocumentSliceData = {
	dsl_spacers: string;
	dsl_styleslices: Array<{
		stsl_type: string;
		stsl_styles?: Array<null | object>;
	}>;
};
