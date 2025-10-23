/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/insertgoogledocsfootnotes
 */

import type { ViewDocumentFragment, ViewUpcastWriter, ViewText, ViewElement } from 'ckeditor5/src/engine.js';

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
	let lastTextNode: ViewText | null = null;

	// The core of this filter is to find the correct positions for footnote references.
	// Google Docs clipboard data provides a "template" string called `dsl_spacers` that maps the content.
	// Footnote references are marked with a '#' character in this template.
	// The text content from the clipboard does not contain these '#' markers (excluding normal text `#` characters).
	//
	// This algorithm iterates over the text content character by character (ignoring whitespaces)
	// and simultaneously over the `dsl_spacers` template (also ignoring whitespaces).
	// When a '#' is found in the template, it means a footnote reference should be inserted at the
	// current position in the text content.
	//
	// Example:
	//
	// Content:  "This is a sample text with a footnote."
	// Template: "This is a sample text with a footnote#."
	//
	// Alignment process:
	//
	// Content:  T h i s   i s   a   s a m p l e   t e x t   w i t h   a   f o o t n o t e .
	//           ^                                                                       ^
	//           |                                                                       |
	// Template: T h i s   i s   a   s a m p l e   t e x t   w i t h   a   f o o t n o t e # .
	//           ^                                                                         ^
	//
	// When the template cursor encounters '#', the algorithm records the position in the content.
	//
	// Content:  ... f o o t n o t e .
	//                             ^
	//                             |---- Footnote position identified after this character.
	// Template: ... f o o t n o t e # .
	//                             ^

	// Process text content character by character, synchronizing with template
	const template = slice.dsl_spacers;
	let templateCursor = 0;
	let footnoteCounter = 0;

	for ( const { item } of writer.createRangeIn( documentFragment ) ) {
		if ( !item.is( '$textProxy' ) ) {
			continue;
		}

		for ( let i = 0; i < item.data.length; i++ ) {
			const contentChar = item.data[ i ];

			// Skip whitespaces in content (they don't align with template).
			if ( isWhitespaceOrSeparator( contentChar ) ) {
				continue;
			}

			// Advance template cursor to next meaningful character.
			templateCursor = advanceTemplateToNextMeaningfulChar( template, templateCursor );

			// Check if template is exhausted
			if ( templateCursor >= template.length ) {
				break;
			}

			const templateChar = template[ templateCursor ];

			// Found footnote marker in template where content has normal character/
			if ( templateChar === '#' && contentChar !== '#' ) {
				// Handle edge case: if character after '#' in template is newline, insert at end of previous text node.
				// This is necessary when a footnote is at the very end of a block-level element (like a paragraph).
				// In such cases, the template looks like this:
				//
				// Template: "Some text.#\n"
				//
				// The `\n` indicates the end of the block. Without this special handling, the footnote would be
				// incorrectly associated with the beginning of the *next* text node if it existed.
				//
				// Visual explanation:
				//
				// Let's assume content: "First paragraph.Second paragraph." with template: "First paragraph.#\nSecond paragraph."
				// The view might look like this:
				//
				// <p>
				//   <$text>"First paragraph."</$text>
				// </p>
				// <p>
				//   <$text>"Second paragraph."</$text>
				// </p>
				//
				// When processing `contentChar` = 'S' from "Second paragraph.":
				//
				// lastTextNode: <$text>"First paragraph."
				//
				// Content:      F i r s t   p a r a g r a p h .   S e c o n d   p a r a g r a p h .
				//               ^                                 ^
				//                                                 Text cursor is here (pointing to 'S')
				//
				// Template:     F i r s t   p a r a g r a p h . # \n S e c o n d . . .
				//                                               ^
				//                                               templateCursor is here (pointing to '#')
				//
				// The current character in template is '#', and the character after '#' is '\n'.
				// This indicates the footnote should be at the end of the current text node ("First paragraph.").
				// So, we must use `lastTextNode` to place the footnote at `lastTextNode.data.length`.
				const insertAtPreviousNode = template[ templateCursor + 1 ] === '\n' && lastTextNode;

				if ( insertAtPreviousNode ) {
					footnotePositions.push( {
						textNode: lastTextNode!,
						offset: lastTextNode!.data.length,
						footnoteIndex: footnoteCounter++
					} );
				} else {
					footnotePositions.push( {
						textNode: item.textNode,
						offset: Math.max( 0, i - 1 ),
						footnoteIndex: footnoteCounter++
					} );
				}

				// Skip the '#' marker.
				templateCursor++;

				// Advance cursor to avoid pointing to the whitespace which will fail template/content alignment.
				templateCursor = advanceTemplateToNextMeaningfulChar( template, templateCursor );
			}

			// Verify template and content alignment. If misaligned, stop processing.
			if ( templateCursor < template.length && template[ templateCursor ] !== contentChar ) {
				break;
			}

			templateCursor++;
			lastTextNode = item.textNode;
		}
	}

	// Handle remaining footnote markers at the end of template.
	// This handles cases where footnotes appear after all content has been processed.
	// For example, when multiple footnotes are at the very end of the document:
	//
	// Content:  "Final sentence."
	// Template: "Final sentence.##"

	// Both '#' markers at the end need to be converted to footnote references
	// and inserted at the end of the last text node.
	if ( lastTextNode ) {
		templateCursor = advanceTemplateToNextMeaningfulChar( template, templateCursor );

		while ( templateCursor < template.length && template[ templateCursor ] === '#' ) {
			footnotePositions.push( {
				textNode: lastTextNode,
				offset: lastTextNode.data.length,
				footnoteIndex: footnoteCounter++
			} );

			templateCursor++; // Skip the '#' marker.
			templateCursor = advanceTemplateToNextMeaningfulChar( template, templateCursor );
		}
	}

	// Extract footnote definitions from Google Docs clipboard data.
	const footnotesSliceDefinitions = footnotesSliceStyle.stsl_styles?.reduce<Array<string>>( ( acc, style ) => {
		const footnoteSliceId = style?.fs_id;

		if ( !footnoteSliceId ) {
			return acc;
		}

		let content = slice.dsl_relateddocslices?.[ footnoteSliceId ]?.dsl_spacers;

		if ( content === undefined ) {
			return acc;
		}

		// Remove leading escaped character that appears in empty footnotes.
		if ( content.startsWith( '\u0003' ) ) {
			content = content.slice( 1 );
		}

		acc.push( content.trim() );
		return acc;
	}, [] );

	if ( !footnotesSliceDefinitions?.length || footnotePositions.length === 0 ) {
		return;
	}

	// Create footnotes list container.
	const footnotesDefinitionsList = createFootnotesListViewElement( writer );

	// Insert footnote references and create definitions (process in reverse to preserve positions).
	for ( let i = footnotePositions.length - 1; i >= 0; i-- ) {
		const position = footnotePositions[ i ];
		const footnoteId = `gdocs-footnote-${ position.footnoteIndex + 1 }`;
		const footnoteContent = footnotesSliceDefinitions[ position.footnoteIndex ] || '';

		// Insert footnote reference at the calculated position.
		insertFootnoteReferenceInText( writer, position, footnoteId );

		// Create footnote definition.
		const defElements = createFootnoteDefViewElement( writer, footnoteId );

		writer.appendChild( writer.createText( footnoteContent ), defElements.content );
		writer.appendChild( defElements.listItem, footnotesDefinitionsList );
	}

	// Append footnotes list to document.
	writer.appendChild( footnotesDefinitionsList, documentFragment );
}

/**
 * Inserts a footnote reference element at the specified position in the text node.
 *
 * @param writer The view upcast writer.
 * @param position The position where to insert the footnote reference.
 * @param footnoteId The ID of the footnote.
 */
function insertFootnoteReferenceInText(
	writer: ViewUpcastWriter,
	position: FootnotePosition,
	footnoteId: string
): void {
	const footnoteRef = createFootnoteRefViewElement( writer, footnoteId );
	const { textNode, offset } = position;

	const parent = textNode.parent!;
	const textNodeIndex = parent.getChildIndex( textNode );

	// Split text node if the footnote should be inserted in the middle.
	if ( offset > 0 && offset < textNode.data.length ) {
		const beforeText = textNode.data.substring( 0, offset );
		const afterText = textNode.data.substring( offset );

		const beforeTextNode = writer.createText( beforeText );
		const afterTextNode = writer.createText( afterText );

		writer.remove( textNode );
		writer.insertChild( textNodeIndex, beforeTextNode, parent );
		writer.insertChild( textNodeIndex + 1, footnoteRef, parent );
		writer.insertChild( textNodeIndex + 2, afterTextNode, parent );
	} else if ( offset === 0 ) {
		// Insert at the beginning of text node.
		writer.insertChild( textNodeIndex, footnoteRef, parent );
	} else {
		// Insert at the end of text node.
		writer.insertChild( textNodeIndex + 1, footnoteRef, parent );
	}
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
 * Checks whether the given character is a whitespace or Google Docs separator.
 *
 * @param char Character to check.
 * @returns `true` if the character is a whitespace or separator, `false` otherwise.
 */
function isWhitespaceOrSeparator( char: string ): boolean {
	// Check for whitespace characters.
	if ( /\s/.test( char ) ) {
		return true;
	}

	// Check for Unicode control characters used as separators in Google Docs (e.g., \u0010, \u0003, etc.).
	// They occur frequently in `dsl_spacers` when user pastes tables, images, footnotes, etc.
	// These characters are not visible and should be treated as whitespace for alignment purposes.
	const charCode = char.charCodeAt( 0 );

	return charCode <= 0x001F || ( charCode >= 0x007F && charCode <= 0x009F );
}

/**
 * Advances the template cursor to the next meaningful character (non-whitespace, non-separator).
 *
 * @param template The template string to advance in.
 * @param cursor Current cursor position.
 * @returns New cursor position at the next meaningful character.
 */
function advanceTemplateToNextMeaningfulChar( template: string, cursor: number ): number {
	while ( cursor < template.length && isWhitespaceOrSeparator( template[ cursor ] ) ) {
		cursor++;
	}

	return cursor;
}

/**
 * Creates a footnotes list view element.
 *
 * @param writer The view writer instance.
 * @returns The footnotes list view element.
 */
function createFootnotesListViewElement( writer: ViewUpcastWriter ): ViewElement {
	return writer.createElement( 'ol', { class: 'footnotes' } );
}

/**
 * Creates a footnote reference view element.
 *
 * @param writer The view writer instance.
 * @param footnoteId The footnote ID.
 * @returns The footnote reference view element.
 */
function createFootnoteRefViewElement( writer: ViewUpcastWriter, footnoteId: string ): ViewElement {
	const sup = writer.createElement( 'sup', { class: 'footnote' } );
	const link = writer.createElement( 'a', {
		id: `ref-${ footnoteId }`,
		href: `#${ footnoteId }`
	} );

	writer.appendChild( link, sup );

	return sup;
}

/**
 * Creates a footnote definition view element with a backlink and a content container.
 *
 * @param writer The view writer instance.
 * @param footnoteId The footnote ID.
 * @returns An object containing the list item element, backlink and content container.
 */
function createFootnoteDefViewElement( writer: ViewUpcastWriter, footnoteId: string ): {
	listItem: ViewElement;
	content: ViewElement;
} {
	const listItem = writer.createElement( 'li', {
		id: footnoteId,
		class: 'footnote-definition'
	} );

	const backLink = writer.createElement( 'a', {
		href: `#ref-${ footnoteId }`,
		class: 'footnote-backlink'
	} );

	const content = writer.createElement( 'div', {
		class: 'footnote-content'
	} );

	writer.appendChild( writer.createText( '^' ), backLink );
	writer.appendChild( backLink, listItem );
	writer.appendChild( content, listItem );

	return {
		listItem,
		content
	};
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
