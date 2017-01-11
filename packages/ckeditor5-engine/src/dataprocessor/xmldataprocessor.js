/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module engine/dataprocessor/xmldataprocessor
 */

/* globals DOMParser, document */

import BasicHtmlWriter from './basichtmlwriter';
import DomConverter from '../view/domconverter';
import { NBSP_FILLER } from '../view/filler';

/**
 * XmlDataProcessor class.
 * This data processor implementation uses XML as input/output data.
 * This class is needed because unlike HTML, XML allows to use any tag with any value.
 * E.g. `<link>Text</link>` is a valid XML but invalid HTML.
 *
 * @implements module:engine/dataprocessor/dataprocessor~DataProcessor
 */
export default class XmlDataProcessor {
	/**
	 * Creates a new instance of the XmlDataProcessor class.
	 *
	 * @param {Object} options Configuration options.
	 * @param {Array<String>} [options.namespaces=[]] List of namespaces allowed to use in XML input.
	 */
	constructor( options = {} ) {
		/**
		 * List of namespaces allowed to use in XML input.
		 *
		 * E.g. Registering namespaces [ 'attribute', 'container' ] allows to use `<attirbute:tagName></attribute:tagName>` and
		 * `<container:tagName></container:tagName>` input. It is mainly for debugging.
		 *
		 * @public
		 * @member {DOMParser}
		 */
		this.namespaces = options.namespaces || [];

		/**
		 * DOMParser instance used to parse XML string to XMLDocument.
		 *
		 * @private
		 * @member {DOMParser}
		 */
		this._domParser = new DOMParser();

		/**
		 * DOM converter used to convert DOM elements to view elements.
		 *
		 * @private
		 * @member {module:engine/view/domconverter~DomConverter}
		 */
		this._domConverter = new DomConverter( { blockFiller: NBSP_FILLER } );

		/**
		 * BasicHtmlWriter instance used to convert DOM elements to XML string.
		 * There is no need to use dedicated for XML writer because BasicHtmlWriter works well in this case.
		 *
		 * @private
		 * @member {module:engine/dataprocessor/basichtmlwriter~BasicHtmlWriter}
		 */
		this._htmlWriter = new BasicHtmlWriter();
	}

	/**
	 * Converts provided {@link module:engine/view/documentfragment~DocumentFragment DocumentFragment}
	 * to data format- in this case XML string.
	 *
	 * @param {module:engine/view/documentfragment~DocumentFragment} viewFragment
	 * @returns {String} XML string.
	 */
	toData( viewFragment ) {
		// Convert view DocumentFragment to DOM DocumentFragment.
		const domFragment = this._domConverter.viewToDom( viewFragment, document );

		// Convert DOM DocumentFragment to XML output.
		// There is no need to use dedicated for XML serializing method because BasicHtmlWriter works well in this case.
		return this._htmlWriter.getHtml( domFragment );
	}

	/**
	 * Converts provided XML string to view tree.
	 *
	 * @param {String} data XML string.
	 * @returns {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment|null} Converted view element.
	 */
	toView( data ) {
		// Convert input XML data to DOM DocumentFragment.
		const domFragment = this._toDom( data );

		// Convert DOM DocumentFragment to view DocumentFragment.
		return this._domConverter.domToView( domFragment, { keepOriginalCase: true } );
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
		// Stringify namespaces.
		const namespaces = this.namespaces.map( nsp => `xmlns:${ nsp }="nsp"` ).join( ' ' );

		// Wrap data into root element with optional namespace definitions.
		data = `<xml ${ namespaces }>${ data }</xml>`;

		const parsedDocument = this._domParser.parseFromString( data, 'text/xml' );

		// Parse validation.
		const parserError = parsedDocument.querySelector( 'parsererror' );

		if ( parserError ) {
			throw new Error( 'Parse error - ' + parserError.textContent );
		}

		const fragment = parsedDocument.createDocumentFragment();
		const nodes = parsedDocument.documentElement.childNodes;

		while ( nodes.length > 0 ) {
			fragment.appendChild( nodes[ 0 ] );
		}

		return fragment;
	}
}
