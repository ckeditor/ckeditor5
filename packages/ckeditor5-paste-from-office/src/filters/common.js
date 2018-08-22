/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

const htmlDataProcessor = new HtmlDataProcessor();

/**
 * Extracts `body` tag contents from the provided HTML string.
 *
 * @param {Object} data
 * @param {String} data.html HTML string from which `body` contents will be extracted.
 * @returns {Object} result
 * @returns {String|null} result.body Extracted `body` contents. If `body` tag was not present null is returned.
 */
export function extractBody( data ) {
	const bodyRegexp = /<body[^>]*>([\s*|\S*]*?)<\/body>/i;
	const bodyMatch = data.html.match( bodyRegexp );

	data.body = bodyMatch && bodyMatch[ 1 ] ? bodyMatch[ 1 ] : null;

	return data;
}

/**
 * Parses provided HTML string to {@link module:engine/view/view~View} element.
 *
 * @param {Object} data
 * @param {String} data.body HTML string which should be parsed.
 * @returns {Object} result
 * @returns {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment|null} result.view
 * The {@link module:engine/view/view~View} class instance created based on provided HTML string.
 * Returns `null` if `data.body` parameter was empty.
 */
export function bodyToView( data ) {
	data.view = data.body ? htmlDataProcessor.toView( data.body ) : null;

	return data;
}

/**
 * Extracts `style` tags content from provided HTML string and combines into one string.
 *
 * @param {Object} data
 * @param {String} data.html HTML string from which `style` tags content will be extracted.
 * @returns {Object} result
 * @returns {String|null} result.styles Extracted `style` tags content. If there were no `style` tags, `null` is returned.
 */
export function extractStyles( data ) {
	const styleRegexp = /<style[^>]*>([\s*|\S*]*?)<\/style>/gi;

	let styles = '';

	let styleMatch;
	while ( ( styleMatch = styleRegexp.exec( data.html ) ) !== null ) {
		if ( styleMatch && styleMatch[ 1 ] ) {
			styles += styleMatch[ 1 ];
		}
	}

	data.styles = styles.length ? styles : null;

	return data;
}

/**
 * Parses given styles string returning native `CSSStyleSheet` object.
 *
 * @param {Object} data
 * @param {String} data.styles Styles to be parse.
 * @param {Document} domDocument Document used to create helper element in which stylesheet will be injected.
 * @returns {Object} result
 * @returns {CSSStyleSheet|null} result.stylesheet Native `CSSStyleSheet` object containing parsed styles
 * or `null` if `data.styles` or `domDocument` were not provided.
 */
export function stylesToStylesheet( data, domDocument ) {
	data.stylesheet = null;

	if ( data.styles && domDocument ) {
		// Replace invalid CSS selectors so they can be correctly parsed:
		//		* `@list lX:levelX` with `at_list lX_levelX`
		//		* `@list lX` with `at_list lX`
		const styles = data.styles
			.replace( /@list\s+l(\d+):level(\d+)/g, 'at_list l$1_level$2' )
			.replace( /@list /g, 'at_list ' );

		data.stylesheet = parseCSS( styles, domDocument );
	}

	return data;
}

// Parses provided CSS string creating native `CSSStyleSheet` object.
//
// If available this function use shadow DOM element to parse CSS. If not it fallback to ifrmae element.
//
// @param {String} cssString String containing CSS rules/stylsheet to be parsed.
// @param {Document} domDocument Document used to create helper element in which stylesheet will be injected.
// @returns {CSSStyleSheet} Native `CSSStyleSheet` object containing parsed styles.
function parseCSS( cssString, domDocument ) {
	const style = domDocument.createElement( 'style' );

	let wrapper = null;

	if ( domDocument.head && domDocument.head.attachShadow ) {
		// Use shadow DOM if available.
		wrapper = domDocument.createElement( 'div' );
		const shadowRoot = wrapper.attachShadow( { mode: 'open' } );

		wrapper.hidden = true;

		domDocument.body.appendChild( wrapper );
		shadowRoot.appendChild( style );
	} else {
		// Use iframe element.
		wrapper = domDocument.createElement( 'iframe' );

		wrapper.hidden = true;

		domDocument.body.appendChild( wrapper );
		wrapper.contentDocument.documentElement.appendChild( style );
	}

	style.textContent = cssString;

	const stylesheet = style.sheet;

	wrapper.remove();

	return stylesheet;
}
