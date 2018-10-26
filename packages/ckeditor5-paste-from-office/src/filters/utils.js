/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module paste-from-office/filters/utils
 */

/* globals DOMParser */

import DomConverter from '@ckeditor/ckeditor5-engine/src/view/domconverter';
import { NBSP_FILLER } from '@ckeditor/ckeditor5-engine/src/view/filler';

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

	// Parse htmlString as native Document object.
	const htmlDocument = domParser.parseFromString( normalizeEndTagsPrecedingSpace( htmlString ), 'text/html' );

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
	const domConverter = new DomConverter( { blockFiller: NBSP_FILLER } );
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

// Replaces last space preceding elements closing tag with `&nbsp;`. Such operation prevents spaces from being removed
// during further DOM/View processing (see especially {@link module:engine/view/domconverter~DomConverter#_processDataFromDomText}).
// This method also takes into account Word specific `<o:p></o:p>` empty tags.
//
// @param {String} htmlString HTML string in which spacing should be normalized.
// @returns {String} Input HTML with spaces normalized.
function normalizeEndTagsPrecedingSpace( htmlString ) {
	return htmlString
		.replace( / <\//g, '\u00A0</' )
		.replace( / <o:p><\/o:p>/g, '\u00A0<o:p></o:p>' );
}

// Normalizes spacing in special Word `spacerun spans` (`<span style='mso-spacerun:yes'>\s+</span>`) by replacing
// all spaces with `&nbsp; ` pairs. This prevents spaces from being removed during further DOM/View processing
// (see especially {@link module:engine/view/domconverter~DomConverter#_processDataFromDomText}).
//
// @param {Document} htmlDocument Native `Document` object in which spacing should be normalized.
function normalizeSpacerunSpans( htmlDocument ) {
	htmlDocument.querySelectorAll( 'span[style*=spacerun]' ).forEach( el => {
		// Use `el.childNodes[ 0 ].data.length` instead of `el.innerText.length`. For `el.innerText.length` which
		// contains spaces mixed with `&nbsp;` Edge browser returns incorrect length.
		const innerTextLength = el.childNodes[ 0 ].data.length;

		el.innerHTML = Array( innerTextLength + 1 ).join( '\u00A0 ' ).substr( 0, innerTextLength );
	} );
}
