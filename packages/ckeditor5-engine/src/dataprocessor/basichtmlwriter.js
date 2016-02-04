/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/**
 * BasicHtmlWriter class.
 * Basic HTML writer, it uses native `innerHTML` property for basic conversion
 * from DocumentFragment to HTML string.
 *
 * @class dataProcessor.BasicHtmlWriter
 */
export default class BasicHtmlWriter {
	/**
	 * Returns HTML string created from DocumentFragment.
	 *
	 * @param {DocumentFragment} fragment
	 * @returns {String}
	 */
	getHtml( fragment ) {
		const container = document.createElement( 'div' );
		container.appendChild( fragment );

		return container.innerHTML;
	}
}
