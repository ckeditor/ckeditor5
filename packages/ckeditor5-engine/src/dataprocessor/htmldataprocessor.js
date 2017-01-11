/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/dataprocessor/htmldataprocessor
 */

/* globals document, DOMParser */

import BasicHtmlWriter from './basichtmlwriter';
import DomConverter from '../view/domconverter';
import { NBSP_FILLER } from '../view/filler';

/**
 * HtmlDataProcessor class.
 * This data processor implementation uses HTML as input/output data.
 *
 * @implements module:engine/dataprocessor/dataprocessor~DataProcessor
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
		 * @member {DOMParser}
		 */
		this._domParser = new DOMParser();

		/**
		 * DOM converter used to convert DOM elements to view elements.
		 *
		 * @private
		 * @member
		 */
		this._domConverter = new DomConverter( { blockFiller: NBSP_FILLER } );

		/**
		 * BasicHtmlWriter instance used to convert DOM elements to HTML string.
		 *
		 * @private
		 * @member {module:engine/dataprocessor/basichtmlwriter~BasicHtmlWriter}
		 */
		this._htmlWriter = new BasicHtmlWriter();
	}

	/**
	 * Converts provided {@link module:engine/view/documentfragment~DocumentFragment DocumentFragment}
	 * to data format - in this case HTML string.
	 *
	 * @param {module:engine/view/documentfragment~DocumentFragment} viewFragment
	 * @returns {String} HTML string.
	 */
	toData( viewFragment ) {
		// Convert view DocumentFragment to DOM DocumentFragment.
		const domFragment = this._domConverter.viewToDom( viewFragment, document );

		// Convert DOM DocumentFragment to HTML output.
		return this._htmlWriter.getHtml( domFragment );
	}

	/**
	 * Converts provided HTML string to view tree.
	 *
	 * @param {String} data HTML string.
	 * @returns {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment|null} Converted view element.
	 */
	toView( data ) {
		// Convert input HTML data to DOM DocumentFragment.
		const domFragment = this._toDom( data );

		// Convert DOM DocumentFragment to view DocumentFragment.
		return this._domConverter.domToView( domFragment );
	}

	/**
	 * Converts HTML String to its DOM representation. Returns DocumentFragment, containing nodes parsed from
	 * provided data.
	 *
	 * @private
	 * @param {String} data
	 * @returns {DocumentFragment}
	 */
	_toDom( data ) {
		const document = this._domParser.parseFromString( data, 'text/html' );
		const fragment = document.createDocumentFragment();
		const nodes = document.body.childNodes;

		while ( nodes.length > 0 ) {
			fragment.appendChild( nodes[ 0 ] );
		}

		return fragment;
	}
}
