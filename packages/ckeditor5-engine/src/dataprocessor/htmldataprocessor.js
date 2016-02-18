/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import BasicHtmlWriter from './basichtmlwriter.js';

/**
 * Creates a new instance of the HtmlDataProcessor class.
 *
 * @classdesc HtmlDataProcessor class.
 * This data processor implementation uses HTML as input/output data.
 *
 * @class core.dataProcessor.HtmlDataProcessor
 * @implements core.dataProcessor.DataProcessor
 */
export default class HtmlDataProcessor {
	constructor() {
		/**
		 * DOMParser instance used to parse HTML string to HTMLDocument.
		 *
		 * @member core.dataProcessor.HtmlDataProcessor#_domParser
		 * @private
		 * @type {DOMParser}
		 */
		this._domParser = new DOMParser();

		/**
		 * BasicHtmlWriter instance used to convert DOM elements to HTML string.
		 *
		 * @member core.dataProcessor.HtmlDataProcessor#_htmlWriter
		 * @private
		 * @type {core.dataProcessor.BasicHtmlWriter}
		 */
		this._htmlWriter = new BasicHtmlWriter();
	}

	/**
	 * Converts provided document fragment to data format - in this case HTML string.
	 *
	 * @param {DocumentFragment} fragment
	 * @returns {String}
	 */
	toData( fragment ) {
		return this._htmlWriter.getHtml( fragment );
	}

	/**
	 * Converts HTML String to its DOM representation. Returns DocumentFragment, containing nodes parsed from
	 * provided data.
	 *
	 * @param {String} data
	 * @returns {DocumentFragment}
	 */
	toDom( data ) {
		const document = this._domParser.parseFromString( data, 'text/html' );
		const fragment = document.createDocumentFragment();
		const nodes = document.body.childNodes;

		while ( nodes.length > 0 ) {
			fragment.appendChild( nodes[ 0 ] );
		}

		return fragment;
	}
}
