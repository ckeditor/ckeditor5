/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module paste-from-office/filters/parse
 */

import {
	DomConverter,
	ViewDocument,
	type StylesProcessor,
	type ViewDocumentFragment
} from 'ckeditor5/src/engine.js';

import { normalizeSpacing, normalizeSpacerunSpans } from './space.js';

/**
 * Parses the provided HTML extracting contents of `<body>` and `<style>` tags.
 *
 * @param htmlString HTML string to be parsed.
 */
export function parseHtml( htmlString: string, stylesProcessor: StylesProcessor ): ParseHtmlResult {
	const domParser = new DOMParser();

	// Remove Word specific "if comments" so content inside is not omitted by the parser.
	htmlString = htmlString.replace( /<!--\[if gte vml 1]>/g, '' );

	// Clean the <head> section of MS Windows specific tags. See https://github.com/ckeditor/ckeditor5/issues/15333.
	// The regular expression matches the <o:SmartTagType> tag with optional attributes (with or without values).
	htmlString = htmlString.replace( /<o:SmartTagType(?:\s+[^\s>=]+(?:="[^"]*")?)*\s*\/?>/gi, '' );

	const normalizedHtml = normalizeSpacing( cleanContentAfterBody( htmlString ) );

	// Parse htmlString as native Document object.
	const htmlDocument = domParser.parseFromString( normalizedHtml, 'text/html' );

	normalizeSpacerunSpans( htmlDocument );

	// Get `innerHTML` first as transforming to View modifies the source document.
	const bodyString = htmlDocument.body.innerHTML;

	// Transform document.body to View.
	const bodyView = documentToView( htmlDocument, stylesProcessor );

	// Extract stylesheets.
	const stylesObject = extractStyles( htmlDocument );

	return {
		body: bodyView,
		bodyString,
		styles: stylesObject.styles,
		stylesString: stylesObject.stylesString
	};
}

/**
 * The result of {@link ~parseHtml}.
 */
export interface ParseHtmlResult {

	/**
	 * Parsed body content as a traversable structure.
	 */
	body: ViewDocumentFragment;

	/**
	 * Entire body content as a string.
	 */
	bodyString: string;

	/**
	 * Array of native `CSSStyleSheet` objects, each representing separate `style` tag from the source HTML.
	 */
	styles: Array<CSSStyleSheet>;

	/**
	 * All `style` tags contents combined in the order of occurrence into one string.
	 */
	stylesString: string;
}

/**
 * Transforms native `Document` object into {@link module:engine/view/documentfragment~DocumentFragment}. Comments are skipped.
 *
 * @param htmlDocument Native `Document` object to be transformed.
 */
function documentToView( htmlDocument: Document, stylesProcessor: StylesProcessor ) {
	const viewDocument = new ViewDocument( stylesProcessor );
	const domConverter = new DomConverter( viewDocument, { renderingMode: 'data' } );
	const fragment = htmlDocument.createDocumentFragment();
	const nodes = htmlDocument.body.childNodes;

	while ( nodes.length > 0 ) {
		fragment.appendChild( nodes[ 0 ] );
	}

	return domConverter.domToView( fragment, { skipComments: true } ) as ViewDocumentFragment;
}

/**
 * Extracts both `CSSStyleSheet` and string representation from all `style` elements available in a provided `htmlDocument`.
 *
 * @param htmlDocument Native `Document` object from which styles will be extracted.
 */
function extractStyles( htmlDocument: Document ): { styles: Array<CSSStyleSheet>; stylesString: string } {
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

/**
 * Removes leftover content from between closing </body> and closing </html> tag:
 *
 * ```html
 * <html><body><p>Foo Bar</p></body><span>Fo</span></html> -> <html><body><p>Foo Bar</p></body></html>
 * ```
 *
 * This function is used as specific browsers (Edge) add some random content after `body` tag when pasting from Word.
 * @param htmlString The HTML string to be cleaned.
 * @returns The HTML string with leftover content removed.
 */
function cleanContentAfterBody( htmlString: string ) {
	const bodyCloseTag = '</body>';
	const htmlCloseTag = '</html>';

	const bodyCloseIndex = htmlString.indexOf( bodyCloseTag );

	if ( bodyCloseIndex < 0 ) {
		return htmlString;
	}

	const htmlCloseIndex = htmlString.indexOf( htmlCloseTag, bodyCloseIndex + bodyCloseTag.length );

	return htmlString.substring( 0, bodyCloseIndex + bodyCloseTag.length ) +
		( htmlCloseIndex >= 0 ? htmlString.substring( htmlCloseIndex ) : '' );
}
