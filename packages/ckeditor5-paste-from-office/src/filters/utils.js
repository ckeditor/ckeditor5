/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module pastefromoffice/filters/utils
 */

/* globals DOMParser */

import DomConverter from '@ckeditor/ckeditor5-engine/src/view/domconverter';
import { NBSP_FILLER } from '@ckeditor/ckeditor5-engine/src/view/filler';

const domParser = new DOMParser();
const domConverter = new DomConverter( { blockFiller: NBSP_FILLER } );

/**
 * Parses provided HTML extracting contents of `body` and `style` tags.
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
	// Parse htmlString as native Document object.
	const htmlDocument = domParser.parseFromString( htmlString, 'text/html' );

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
	const fragment = htmlDocument.createDocumentFragment();
	const nodes = htmlDocument.body.childNodes;

	while ( nodes.length > 0 ) {
		fragment.appendChild( nodes[ 0 ] );
	}

	return domConverter.domToView( fragment );
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

	for ( const el of htmlDocument.all ) {
		if ( el.tagName.toLowerCase() === 'style' && el.sheet && el.sheet.rules && el.sheet.rules.length ) {
			styles.push( el.sheet );
			stylesString.push( el.innerHTML );
		}
	}

	return {
		styles,
		stylesString: stylesString.join( ' ' )
	};
}
