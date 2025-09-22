/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/insertgoogledocsfootnotes
 */

import type { ViewDocumentFragment, ViewUpcastWriter, ViewText } from 'ckeditor5/src/engine.js';

import {
	createFootnoteDefViewElement,
	createFootnoteRefViewElement,
	createFootnotesListViewElement
} from './footnote.js';

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

	const footnotePositions: Array<FootnotePosition> = [];
	let data = '';
	let lastTextNode: ViewText | null = null;

	// Google Docs use some whitespaces within the `dsl_spacers` string to indicate regions where elements start or end.
	// It applies to tables, lists, etc. However, footnotes references are always marked with `#` character, without any whitespaces.
	// To keep the processing simple, remove all whitespaces from the `dsl_spacers` string.
	const template = dropWhitespaces( slice.dsl_spacers );
	let templateMismatch = false;
	let footnoteCounter = 0;

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
				footnotePositions.push( {
					textNode: item.textNode,
					offset: Math.max( 0, i - 1 ),
					footnoteIndex: footnoteCounter++
				} );

				data += '#' + char;
				continue;
			}

			data += char;
			lastTextNode = item.textNode;

			// Something is wrong with the data or the template, they are not aligned. Stop processing.
			// Let's analyze what we collected so far.
			if ( char !== template[ data.length - 1 ] ) {
				templateMismatch = true;
				break;
			}
		}

		if ( templateMismatch ) {
			break;
		}
	}

	// If we processed all text, but there's still some template left, it means that the rest of the template
	// contains only footnote spacers. Add them all.
	if ( !templateMismatch && data.length < template.length && lastTextNode ) {
		for ( let i = data.length; i < template.length; i++ ) {
			// Something is wrong with the data or the template, they are not aligned. Stop processing.
			// Let's analyze what we collected so far.
			if ( template[ i ] !== '#' ) {
				break;
			}

			// Store footnote position for later processing
			footnotePositions.push( {
				textNode: lastTextNode,
				offset: lastTextNode.data.length,
				footnoteIndex: footnoteCounter++
			} );

			data += '#';
		}
	}

	// Extract all footnote definitions defined in the footnote style slice.
	// The order of the definitions corresponds to the order of footnote references in the text.
	const footnotesSliceDefinitions = footnotesSliceStyle.stsl_styles?.reduce<Array<string>>( ( acc, style ) => {
		const footnoteSliceId = style?.fs_id;

		if ( !footnoteSliceId ) {
			return acc;
		}

		let content = slice.dsl_relateddocslices?.[ footnoteSliceId ]?.dsl_spacers;

		if ( content === undefined ) {
			return acc;
		}

		// Remove the leading escaped `\u0003` character that appears in case of empty footnote.
		if ( content.startsWith( '\u0003' ) ) {
			content = content.slice( 1 );
		}

		acc.push( content.trim() );
		return acc;
	}, [] );

	if ( !footnotesSliceDefinitions?.length || footnotePositions.length === 0 ) {
		return;
	}

	// Phase 2: Create footnotes definitions list and append it to the document fragment.
	const footnotesDefinitionsList = createFootnotesListViewElement( writer );

	// Phase 3: Replace footnote positions with footnote references in reverse order (to preserve positions).
	// We iterate in reverse order to avoid shifting positions when inserting elements.
	for ( let i = footnotePositions.length - 1; i >= 0; i-- ) {
		const position = footnotePositions[ i ];
		const footnoteId = `gdocs-footnote-${ position.footnoteIndex + 1 }`;
		const footnoteContent = footnotesSliceDefinitions[ position.footnoteIndex ];

		if ( !footnoteContent ) {
			continue;
		}

		// Create footnote reference element
		const footnoteRef = createFootnoteRefViewElement( writer, footnoteId );

		// Insert footnote reference at the correct position
		const parent = position.textNode.parent!;
		const textNodeIndex = parent.getChildIndex( position.textNode );

		// Split text node if needed
		if ( position.offset > 0 && position.offset < position.textNode.data.length ) {
			const beforeText = position.textNode.data.substring( 0, position.offset );
			const afterText = position.textNode.data.substring( position.offset );

			const beforeTextNode = writer.createText( beforeText );
			const afterTextNode = writer.createText( afterText );

			writer.remove( position.textNode );
			writer.insertChild( textNodeIndex, beforeTextNode, parent );
			writer.insertChild( textNodeIndex + 1, footnoteRef, parent );
			writer.insertChild( textNodeIndex + 2, afterTextNode, parent );
		} else if ( position.offset === 0 ) {
			// Insert at the beginning of text node
			writer.insertChild( textNodeIndex, footnoteRef, parent );
		} else {
			// Insert at the end of text node
			writer.insertChild( textNodeIndex + 1, footnoteRef, parent );
		}

		// Create footnote definition
		const defElements = createFootnoteDefViewElement( writer, footnoteId );

		writer.appendChild( writer.createText( footnoteContent ), defElements.content );
		writer.appendChild( defElements.listItem, footnotesDefinitionsList );
	}

	// Phase 4: Append footnotes definitions list to the end of the document fragment.
	writer.appendChild( footnotesDefinitionsList, documentFragment );
}

/**
 * Describes position of a footnote reference within a text node.
 */
type FootnotePosition = {
	textNode: ViewText;
	offset: number;
	footnoteIndex: number;
};

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
		stsl_styles?: Array<null | { fs_id?: string }>;
	}>;
	dsl_relateddocslices?: Record<string, {
		dsl_spacers: string;
	}>;
};
