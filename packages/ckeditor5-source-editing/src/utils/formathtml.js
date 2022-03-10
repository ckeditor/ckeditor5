/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module source-editing/utils/formathtml
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
 * @param {String} input An HTML string to format.
 * @returns {String}
 */
export function formatHtml( input ) {
	// A list of block-like elements around which the new lines should be inserted, and within which
	// the indentation of their children should be increased.
	// The list is partially based on https://developer.mozilla.org/en-US/docs/Web/HTML/Block-level_elements that contains
	// a full list of HTML block-level elements.
	// A void element is an element that cannot have any child - https://html.spec.whatwg.org/multipage/syntax.html#void-elements.
	const elementsToFormat = [
		{ name: 'address', isVoid: false },
		{ name: 'article', isVoid: false },
		{ name: 'aside', isVoid: false },
		{ name: 'blockquote', isVoid: false },
		{ name: 'br', isVoid: true },
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
		{ name: 'input', isVoid: true },
		{ name: 'li', isVoid: false },
		{ name: 'main', isVoid: false },
		{ name: 'nav', isVoid: false },
		{ name: 'ol', isVoid: false },
		{ name: 'p', isVoid: false },
		{ name: 'pre', isVoid: false },
		{ name: 'section', isVoid: false },
		{ name: 'table', isVoid: false },
		{ name: 'tbody', isVoid: false },
		{ name: 'td', isVoid: false },
		{ name: 'textarea', isVoid: false },
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
		// Divide input string into lines, which start with either an opening tag, a closing tag, or just a text.
		.split( '\n' );

	let indentCount = 0;

	return lines
		.filter( line => line.length )
		.map( line => {
			if ( isNonVoidOpeningTag( line, elementsToFormat ) ) {
				return indentLine( line, indentCount++ );
			}

			if ( isClosingTag( line, elementsToFormat ) ) {
				return indentLine( line, --indentCount );
			}

			return indentLine( line, indentCount );
		} )
		.join( '\n' );
}

// Checks, if an argument is an opening tag of a non-void element to be formatted.
//
// @param {String} line String to check.
// @param {Array} elementsToFormat Elements to be formatted.
// @param {String} elementsToFormat.name Element name.
// @param {Boolean} elementsToFormat.isVoid Flag indicating whether element is a void one.
// @returns {Boolean}
function isNonVoidOpeningTag( line, elementsToFormat ) {
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

// Checks, if an argument is a closing tag.
//
// @param {String} line String to check.
// @param {Array} elementsToFormat Elements to be formatted.
// @param {String} elementsToFormat.name Element name.
// @param {Boolean} elementsToFormat.isVoid Flag indicating whether element is a void one.
// @returns {Boolean}
function isClosingTag( line, elementsToFormat ) {
	return elementsToFormat.some( element => {
		return new RegExp( `</${ element.name }>` ).test( line );
	} );
}

// Indents a line by a specified number of characters.
//
// @param {String} line Line to indent.
// @param {Number} indentCount Number of characters to use for indentation.
// @param {String} [indentChar] Indentation character(s). 4 spaces by default.
// @returns {String}
function indentLine( line, indentCount, indentChar = '    ' ) {
	return `${ indentChar.repeat( indentCount ) }${ line }`;
}
