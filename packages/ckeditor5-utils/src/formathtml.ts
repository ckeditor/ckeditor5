/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module utils/formathtml
 */

/**
 * A simple (and naive) HTML code formatter that returns a formatted HTML markup that can be easily
 * parsed by human eyes. It beautifies the HTML code by adding new lines between elements that behave like block elements
 * (https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements
 * and a few more like `tr`, `td`, and similar ones) and inserting indents for nested content.
 *
 * WARNING: This function works only on a text that does not contain any indentations or new lines.
 * Calling this function on the already formatted text will damage the formatting.
 *
 * @param input An HTML string to format.
 */
export default function formatHtml( input: string ): string {
	// A list of block-like elements around which the new lines should be inserted, and within which
	// the indentation of their children should be increased.
	// The list is partially based on https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements that contains
	// a full list of HTML block-level elements.
	// A void element is an element that cannot have any child - https://html.spec.whatwg.org/multipage/syntax.html#void-elements.
	// Note that <pre> element is not listed on this list to avoid breaking whitespace formatting.
	// Note that <br> element is not listed and handled separately so no additional white spaces are injected.
	const elementsToFormat: Array<FormattedElementDefinition> = [
		{ name: 'address', isVoid: false },
		{ name: 'article', isVoid: false },
		{ name: 'aside', isVoid: false },
		{ name: 'blockquote', isVoid: false },
		{ name: 'details', isVoid: false },
		{ name: 'dialog', isVoid: false },
		{ name: 'dd', isVoid: false },
		{ name: 'div', isVoid: false },
		{ name: 'dl', isVoid: false },
		{ name: 'dt', isVoid: false },
		{ name: 'fieldset', isVoid: false },
		{ name: 'figcaption', isVoid: false },
		{ name: 'figure', isVoid: false },
		{ name: 'footer', isVoid: false },
		{ name: 'form', isVoid: false },
		{ name: 'h1', isVoid: false },
		{ name: 'h2', isVoid: false },
		{ name: 'h3', isVoid: false },
		{ name: 'h4', isVoid: false },
		{ name: 'h5', isVoid: false },
		{ name: 'h6', isVoid: false },
		{ name: 'header', isVoid: false },
		{ name: 'hgroup', isVoid: false },
		{ name: 'hr', isVoid: true },
		{ name: 'li', isVoid: false },
		{ name: 'main', isVoid: false },
		{ name: 'nav', isVoid: false },
		{ name: 'ol', isVoid: false },
		{ name: 'p', isVoid: false },
		{ name: 'section', isVoid: false },
		{ name: 'table', isVoid: false },
		{ name: 'tbody', isVoid: false },
		{ name: 'td', isVoid: false },
		{ name: 'th', isVoid: false },
		{ name: 'thead', isVoid: false },
		{ name: 'tr', isVoid: false },
		{ name: 'ul', isVoid: false }
	];

	const elementNamesToFormat = elementsToFormat.map( element => element.name ).join( '|' );

	// It is not the fastest way to format the HTML markup but the performance should be good enough.
	const lines = input
		// Add new line before and after `<tag>` and `</tag>`.
		// It may separate individual elements with two new lines, but this will be fixed below.
		.replace( new RegExp( `</?(${ elementNamesToFormat })( .*?)?>`, 'g' ), '\n$&\n' )
		// Keep `<br>`s at the end of line to avoid adding additional whitespaces before `<br>`.
		.replace( /<br[^>]*>/g, '$&\n' )
		// Divide input string into lines, which start with either an opening tag, a closing tag, or just a text.
		.split( '\n' );

	let indentCount = 0;
	let isPreformattedLine: ReturnType<typeof isPreformattedBlockLine> = false;

	return lines
		.map( line => {
			isPreformattedLine = isPreformattedBlockLine( line, isPreformattedLine );

			// Ignore empty lines outside a <pre> block.
			if ( !line.length && !isPreformattedLine ) {
				return '';
			}

			if ( isNonVoidOpeningTag( line, elementsToFormat ) ) {
				return indentLine( line, indentCount++ );
			}

			if ( isClosingTag( line, elementsToFormat ) ) {
				return indentLine( line, --indentCount );
			}

			if ( isPreformattedLine === 'middle' || isPreformattedLine === 'last' ) {
				return indentLine( line, 0 );
			}

			return indentLine( line, indentCount );
		} )
		.join( '' )
		.trimEnd();
}

/**
 * Checks, if an argument is an opening tag of a non-void element to be formatted.
 *
 * @param line String to check.
 * @param elementsToFormat Elements to be formatted.
 */
function isNonVoidOpeningTag( line: string, elementsToFormat: Array<FormattedElementDefinition> ): boolean {
	return elementsToFormat.some( element => {
		if ( element.isVoid ) {
			return false;
		}

		if ( !new RegExp( `<${ element.name }( .*?)?>` ).test( line ) ) {
			return false;
		}

		return true;
	} );
}

/**
 * Checks, if an argument is a closing tag.
 *
 * @param line String to check.
 * @param elementsToFormat Elements to be formatted.
 */
function isClosingTag( line: string, elementsToFormat: Array<FormattedElementDefinition> ): boolean {
	return elementsToFormat.some( element => {
		return new RegExp( `</${ element.name }>` ).test( line );
	} );
}

/**
 * Indents a line by a specified number of characters.
 *
 * @param line Line to indent.
 * @param indentCount Number of characters to use for indentation.
 * @param indentChar Indentation character(s). 4 spaces by default.
 */
function indentLine( line: string, indentCount: number, indentChar: string = '    ' ): string {
	// More about Math.max() here in https://github.com/ckeditor/ckeditor5/issues/10698.
	return `${ indentChar.repeat( Math.max( 0, indentCount ) ) }${ line }\n`;
}

/**
 * Checks whether a line belongs to a preformatted (`<pre>`) block.
 *
 * @param line Line to check.
 * @param isPreviousLinePreFormatted Information on whether the previous line was preformatted (and how).
 */
function isPreformattedBlockLine( line: string, isPreviousLinePreFormatted: 'first' | 'last' | 'middle' | false ) {
	const isPreOpen = /<pre( .*?)?>/.test( line );
	const isPreClose = /<\/pre>/.test( line );

	if ( isPreOpen && isPreClose ) {
		// If both an opening and closing a <pre> tag, no special treatment needed.
		return false;
	} else if ( isPreOpen ) {
		return 'first';
	} else if ( isPreClose ) {
		return 'last';
	} else if ( isPreviousLinePreFormatted === 'first' || isPreviousLinePreFormatted === 'middle' ) {
		// This line is just after a 'first' or 'middle' line of a multi-line pre-block.
		return 'middle';
	} else {
		return false;
	}
}

/**
 * Element to be formatted.
 */
interface FormattedElementDefinition {

	/**
	 *  Element name.
	 */
	name: string;

	/**
	 *  Flag indicating whether element is a void one.
	 */
	isVoid: boolean;
}
