/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/dataprocessor/htmldataprocessor
 */

/* globals document, DOMParser */

import BasicHtmlWriter from './basichtmlwriter';
import DomConverter from '../view/domconverter';

/**
 * The HTML data processor class.
 * This data processor implementation uses HTML as input and output data.
 *
 * @implements module:engine/dataprocessor/dataprocessor~DataProcessor
 */
export default class HtmlDataProcessor {
	/**
	 * Creates a new instance of the HTML data processor class.
	 *
	 * @param {module:engine/view/document~Document} document The view document instance.
	 */
	constructor( document ) {
		/**
		 * A DOM parser instance used to parse an HTML string to an HTML document.
		 *
		 * @private
		 * @member {DOMParser}
		 */
		this._domParser = new DOMParser();

		/**
		 * A DOM converter used to convert DOM elements to view elements.
		 *
		 * @private
		 * @member {module:engine/view/domconverter~DomConverter}
		 */
		this._domConverter = new DomConverter( document, { blockFillerMode: 'nbsp' } );

		/**
		 * A basic HTML writer instance used to convert DOM elements to an HTML string.
		 *
		 * @private
		 * @member {module:engine/dataprocessor/basichtmlwriter~BasicHtmlWriter}
		 */
		this._htmlWriter = new BasicHtmlWriter();
	}

	/**
	 * Converts a provided {@link module:engine/view/documentfragment~DocumentFragment document fragment}
	 * to data format &mdash; in this case to an HTML string.
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
	 * Converts the provided HTML string to a view tree.
	 *
	 * @param {String} data An HTML string.
	 * @returns {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment|null} A converted view element.
	 */
	toView( data ) {
		// Convert input HTML data to DOM DocumentFragment.
		const domFragment = this._toDom( data );

		// Convert DOM DocumentFragment to view DocumentFragment.
		return this._domConverter.domToView( domFragment );
	}

	/**
	 * Registers a {@link module:engine/view/matcher~MatcherPattern} for view elements whose content should be treated as a raw data
	 * and not processed during conversion from DOM to view elements.
	 *
	 * The raw data can be later accessed by {@link module:engine/view/element~Element#getCustomProperty view element custom property}
	 * `"$rawContent"`.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} pattern Pattern matching all view elements whose content should
	 * be treated as a raw data.
	 */
	registerRawContentMatcher( pattern ) {
		this._domConverter.registerRawContentMatcher( pattern );
	}

	/**
	 * Converts an HTML string to its DOM representation. Returns a document fragment containing nodes parsed from
	 * the provided data.
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
