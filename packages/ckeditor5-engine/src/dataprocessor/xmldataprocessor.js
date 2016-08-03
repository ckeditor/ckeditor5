/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BasicHtmlWriter from './basichtmlwriter.js';
import DomConverter from '../view/domconverter.js';
import { NBSP_FILLER } from '../view/filler.js';

/**
 * XmlDataProcessor class.
 * This data processor implementation uses XML as input/output data.
 *
 * @memberOf engine.dataProcessor
 * @implements engine.dataProcessor.DataProcessor
 */
export default class XmlDataProcessor {
	/**
	 * Creates a new instance of the XmlDataProcessor class.
	 */
	constructor() {
		/**
		 * DOMParser instance used to parse XML string to XMLDocument.
		 *
		 * @private
		 * @member {DOMParser} engine.dataProcessor.XmlDataProcessor#_domParser
		 */
		this._domParser = new DOMParser();

		/**
		 * DOM converter used to convert DOM elements to view elements.
		 *
		 * @private
		 * @member {engine.view.DomConverter} engine.dataProcessor.XmlDataProcessor#_domConverter.
		 */
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
	 * Converts provided {@link engine.view.DocumentFragment DocumentFragment} to data format - in this case XML string.
	 *
	 * @param {engine.view.DocumentFragment} viewFragment
	 * @returns {String} XML string.
	 */
	toData( viewFragment ) {
		// Convert view DocumentFragment to DOM DocumentFragment.
		const domFragment = this._domConverter.viewToDom( viewFragment, document );

		// Convert DOM DocumentFragment to HTML output.
		return this._htmlWriter.getHtml( domFragment );
	}

	/**
	 * Converts provided XML string to view tree.
	 *
	 * @param {String} data XML string.
	 * @returns {engine.view.Node|engine.view.DocumentFragment|null} Converted view element.
	 */
	toView( data ) {
		// Convert input XML data to DOM DocumentFragment.
		const domFragment = this._toDom( data );

		// Convert DOM DocumentFragment to view DocumentFragment.
		return this._domConverter.domToView( domFragment );
	}

	/**
	 * Converts XML String to its DOM representation. Returns DocumentFragment, containing nodes parsed from
	 * provided data.
	 *
	 * @private
	 * @param {String} data
	 * @returns {DocumentFragment}
	 */
	_toDom( data ) {
		data = `<xml xmlns:attribute="foo" xmlns:container="foo">${ data }</xml>`;

		const document = this._domParser.parseFromString( data, 'text/xml' );

		// Parse validation.
		const parserError = document.querySelector( 'parsererror' );

		if ( parserError ) {
			throw new Error( 'Parse error - ' + parserError.querySelector( 'div' ).textContent );
		}

		const fragment = document.createDocumentFragment();
		const nodes = document.documentElement.childNodes;

		while ( nodes.length > 0 ) {
			fragment.appendChild( nodes[ 0 ] );
		}

		return fragment;
	}
}
