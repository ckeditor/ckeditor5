/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paste-from-office/filters/parse
 */

/* globals DOMParser */

import DomConverter from '@ckeditor/ckeditor5-engine/src/view/domconverter';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';

import { normalizeSpacing, normalizeSpacerunSpans } from './space';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';

/**
 * Parses provided HTML extracting contents of `<body>` and `<style>` tags.
 *
 * @param {String} htmlString HTML string to be parsed.
 * @returns {Object} result
 * @returns {module:engine/view/documentfragment~DocumentFragment} result.body Parsed body
 * content as a traversable structure.
 * @returns {String} result.bodyString Entire body content as a string.
 * @returns {Array.<CSSStyleSheet>} result.styles Array of native `CSSStyleSheet` objects, each representing
 * separate `style` tag from the source HTML.
 * @returns {String} result.stylesString All `style` tags contents combined in the order of occurrence into one string.
 */
export function parseHtml( htmlString ) {
	const domParser = new DOMParser();

	// Remove Word specific "if comments" so content inside is not omitted by the parser.
	htmlString = htmlString.replace( /<!--\[if gte vml 1]>/g, '' );

	const normalizedHtml = normalizeSpacing( cleanContentAfterBody( htmlString ) );

	// Parse htmlString as native Document object.
	const htmlDocument = domParser.parseFromString( normalizedHtml, 'text/html' );

	normalizeSpacerunSpans( htmlDocument );

	// Get `innerHTML` first as transforming to View modifies the source document.
	const bodyString = htmlDocument.body.innerHTML;

	// Transform document.body to View.
	const bodyView = documentToView( htmlDocument );

	// Extract stylesheets.
	const stylesObject = extractStyles( htmlDocument );

	return {
		body: bodyView,
		bodyString,
		styles: stylesObject.styles,
		stylesString: stylesObject.stylesString
	};
}

// Transforms native `Document` object into {@link module:engine/view/documentfragment~DocumentFragment}.
//
// @param {Document} htmlDocument Native `Document` object to be transformed.
// @returns {module:engine/view/documentfragment~DocumentFragment}
function documentToView( htmlDocument ) {
	const domConverter = new DomConverter( { blockFillerMode: 'nbsp' } );
	const fragment = htmlDocument.createDocumentFragment();
	const nodes = htmlDocument.body.childNodes;

	while ( nodes.length > 0 ) {
		fragment.appendChild( nodes[ 0 ] );
	}

	return domConverter.domToView( new ViewDocument( new StylesProcessor() ), fragment );
}

// Extracts both `CSSStyleSheet` and string representation from all `style` elements available in a provided `htmlDocument`.
//
// @param {Document} htmlDocument Native `Document` object from which styles will be extracted.
// @returns {Object} result
// @returns {Array.<CSSStyleSheet>} result.styles Array of native `CSSStyleSheet` object, each representing
// separate `style` tag from the source object.
// @returns {String} result.stylesString All `style` tags contents combined in the order of occurrence as one string.
function extractStyles( htmlDocument ) {
	const styles = [];
	const stylesString = [];
	const styleTags = Array.from( htmlDocument.getElementsByTagName( 'style' ) );

	for ( const style of styleTags ) {
		if ( style.sheet && style.sheet.cssRules && style.sheet.cssRules.length ) {
			styles.push( style.sheet );
			stylesString.push( style.innerHTML );
		}
	}

	return {
		styles,
		stylesString: stylesString.join( ' ' )
	};
}

// Removes leftover content from between closing </body> and closing </html> tag:
//
// 		<html><body><p>Foo Bar</p></body><span>Fo</span></html> -> <html><body><p>Foo Bar</p></body></html>
//
// This function is used as specific browsers (Edge) add some random content after `body` tag when pasting from Word.
// @param {String} htmlString The HTML string to be cleaned.
// @returns {String} The HTML string with leftover content removed.
function cleanContentAfterBody( htmlString ) {
	const regexp = /<\/body>(.*?)(<\/html>|$)/;
	const match = htmlString.match( regexp );

	if ( match && match[ 1 ] ) {
		htmlString = htmlString.slice( 0, match.index ) + htmlString.slice( match.index ).replace( match[ 1 ], '' );
	}

	return htmlString;
}
