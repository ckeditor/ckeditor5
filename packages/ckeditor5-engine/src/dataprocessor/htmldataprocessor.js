/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BasicHtmlWriter from './basichtmlwriter.js';
import DomConverter from '../view/domconverter.js';
import { NBSP_FILLER } from '../view/filler.js';

/**
 * HtmlDataProcessor class.
 * This data processor implementation uses HTML as input/output data.
 *
 * @memberOf engine.dataProcessor
 * @implements engine.dataProcessor.DataProcessor
 */
export default class HtmlDataProcessor {
	/**
	 * Creates a new instance of the HtmlDataProcessor class.
	 */
	constructor() {
		/**
		 * DOMParser instance used to parse HTML string to HTMLDocument.
		 *
		 * @private
		 * @member {DOMParser} engine.dataProcessor.HtmlDataProcessor#_domParser
		 */
		this._domParser = new DOMParser();

		this._domConverter = new DomConverter( { blockFiller: NBSP_FILLER } );

		/**
		 * BasicHtmlWriter instance used to convert DOM elements to HTML string.
		 *
		 * @private
		 * @member {engine.dataProcessor.BasicHtmlWriter} engine.dataProcessor.HtmlDataProcessor#_htmlWriter
		 */
		this._htmlWriter = new BasicHtmlWriter();
	}

	/**
	 * Converts provided view document fragment to data format - in this case HTML string.
	 *
	 * @param {engine.view.DocumentFragment} fragment
	 * @returns {String}
	 */
	toData( viewFragment ) {
		// Convert view DocumentFragment to DOM DocumentFragment.
		const domFragment = this._domConverter.viewToDom( viewFragment, document );

		// Convert DOM DocumentFragment to HTML output.
		return this._htmlWriter.getHtml( domFragment );
	}

	toView( data ) {
		// Convert input HTML data to DOM DocumentFragment.
		const domFragment = this.toDom( data );

		// Convert DOM DocumentFragment to view DocumentFragment.
		return this._domConverter.domToView( domFragment );
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
