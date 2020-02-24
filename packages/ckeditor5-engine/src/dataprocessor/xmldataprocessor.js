/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module engine/dataprocessor/xmldataprocessor
 */

/* globals DOMParser, document */

import BasicHtmlWriter from './basichtmlwriter';
import DomConverter from '../view/domconverter';

/**
 * The XML data processor class.
 * This data processor implementation uses XML as input and output data.
 * This class is needed because unlike HTML, XML allows to use any tag with any value.
 * For example, `<link>Text</link>` is a valid XML but invalid HTML.
 *
 * @implements module:engine/dataprocessor/dataprocessor~DataProcessor
 */
export default class XmlDataProcessor {
	/**
	 * Creates a new instance of the XML data processor class.
	 *
	 * @param {module:engine/view/document~Document} document
	 * @param {Object} options Configuration options.
	 * @param {Array<String>} [options.namespaces=[]] A list of namespaces allowed to use in the XML input.
	 */
	constructor( document, options = {} ) {
		/**
		 * A list of namespaces allowed to use in the XML input.
		 *
		 * For example, registering namespaces [ 'attribute', 'container' ] allows to use `<attirbute:tagName></attribute:tagName>`
		 * and `<container:tagName></container:tagName>` input. It is mainly for debugging.
		 *
		 * @public
		 * @member {DOMParser}
		 */
		this.namespaces = options.namespaces || [];

		/**
		 * DOM parser instance used to parse an XML string to an XML document.
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
		this._domConverter = new DomConverter( document, { blockFillerMode: 'nbsp' } );

		/**
		 * A basic HTML writer instance used to convert DOM elements to an XML string.
		 * There is no need to use a dedicated XML writer because the basic HTML writer works well in this case.
		 *
		 * @private
		 * @member {module:engine/dataprocessor/basichtmlwriter~BasicHtmlWriter}
		 */
		this._htmlWriter = new BasicHtmlWriter();
	}

	/**
	 * Converts the provided {@link module:engine/view/documentfragment~DocumentFragment document fragment}
	 * to data format &mdash; in this case an XML string.
	 *
	 * @param {module:engine/view/documentfragment~DocumentFragment} viewFragment
	 * @returns {String} An XML string.
	 */
	toData( viewFragment ) {
		// Convert view DocumentFragment to DOM DocumentFragment.
		const domFragment = this._domConverter.viewToDom( viewFragment, document );

		// Convert DOM DocumentFragment to XML output.
		// There is no need to use dedicated for XML serializing method because BasicHtmlWriter works well in this case.
		return this._htmlWriter.getHtml( domFragment );
	}

	/**
	 * Converts the provided XML string to a view tree.
	 *
	 * @param {String} data An XML string.
	 * @returns {module:engine/view/node~Node|module:engine/view/documentfragment~DocumentFragment|null} A converted view element.
	 */
	toView( data ) {
		// Convert input XML data to DOM DocumentFragment.
		const domFragment = this._toDom( data );

		// Convert DOM DocumentFragment to view DocumentFragment.
		return this._domConverter.domToView( domFragment, { keepOriginalCase: true } );
	}

	/**
	 * Converts an XML string to its DOM representation. Returns a document fragment containing nodes parsed from
	 * the provided data.
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
