/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type HtmlWriter from './htmlwriter';

/**
 * @module engine/dataprocessor/basichtmlwriter
 */

/* globals document */

/**
 * Basic HTML writer. It uses the native `innerHTML` property for basic conversion
 * from a document fragment to an HTML string.
 *
 * @implements module:engine/dataprocessor/htmlwriter~HtmlWriter
 */
export default class BasicHtmlWriter implements HtmlWriter {
	/**
	 * Returns an HTML string created from the document fragment.
	 *
	 * @param {DocumentFragment} fragment
	 * @returns {String}
	 */
	public getHtml( fragment: DocumentFragment ): string {
		const doc = document.implementation.createHTMLDocument( '' );
		const container = doc.createElement( 'div' );
		container.appendChild( fragment );

		return container.innerHTML;
	}
}
