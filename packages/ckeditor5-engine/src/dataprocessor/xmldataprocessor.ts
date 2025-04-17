/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module engine/dataprocessor/xmldataprocessor
 */

/* globals DOMParser */

import DomConverter from '../view/domconverter.js';

import type DataProcessor from './dataprocessor.js';
import type ViewDocument from '../view/document.js';
import type ViewDocumentFragment from '../view/documentfragment.js';
import type { MatcherPattern } from '../view/matcher.js';

/**
 * The XML data processor class.
 * This data processor implementation uses XML as input and output data.
 * This class is needed because unlike HTML, XML allows to use any tag with any value.
 * For example, `<link>Text</link>` is a valid XML but invalid HTML.
 */
export default class XmlDataProcessor implements DataProcessor {
	/**
	 * A list of namespaces allowed to use in the XML input.
	 *
	 * For example, registering namespaces [ 'attribute', 'container' ] allows to use `<attirbute:tagName></attribute:tagName>`
	 * and `<container:tagName></container:tagName>` input. It is mainly for debugging.
	 */
	public namespaces: Array<string>;

	/**
	 * DOM parser instance used to parse an XML string to an XML document.
	 */
	public domParser: DOMParser;

	/**
	 * DOM converter used to convert DOM elements to view elements.
	 */
	public domConverter: DomConverter;

	public skipComments: boolean = true;

	/**
	 * Creates a new instance of the XML data processor class.
	 *
	 * @param document The view document instance.
	 * @param options Configuration options.
	 * @param options.namespaces A list of namespaces allowed to use in the XML input.
	 */
	constructor( document: ViewDocument, options: { namespaces?: Array<string> } = {} ) {
		this.namespaces = options.namespaces || [];
		this.domParser = new DOMParser();
		this.domConverter = new DomConverter( document, { renderingMode: 'data' } );
	}

	/**
	 * Converts the provided {@link module:engine/view/documentfragment~DocumentFragment document fragment}
	 * to data format &ndash; in this case an XML string.
	 *
	 * @returns An XML string.
	 */
	public toData( viewFragment: ViewDocumentFragment ): string {
		// Convert view DocumentFragment to DOM DocumentFragment.
		const domFragment = this.domConverter.viewToDom( viewFragment );

		// Convert DOM DocumentFragment to XML output.
    	const doc = document.implementation.createHTMLDocument( '' );
    	const container = doc.createElement( 'div' );
    	container.appendChild( domFragment );
    	return this._xmlSerializer.serializeToString(container);
	}

	/**
	 * Converts the provided XML string to a view tree.
	 *
	 * @param data An XML string.
	 * @returns A converted view element.
	 */
	public toView( data: string ): ViewDocumentFragment {
		// Convert input XML data to DOM DocumentFragment.
		const domFragment = this._toDom( data );

		// Convert DOM DocumentFragment to view DocumentFragment.
		return this.domConverter.domToView(
			domFragment,
			{
				keepOriginalCase: true,
				skipComments: this.skipComments
			}
		) as ViewDocumentFragment;
	}

	/**
	 * Registers a {@link module:engine/view/matcher~MatcherPattern} for view elements whose content should be treated as raw data
	 * and not processed during the conversion from XML to view elements.
	 *
	 * The raw data can be later accessed by a
	 * {@link module:engine/view/element~Element#getCustomProperty custom property of a view element} called `"$rawContent"`.
	 *
	 * @param pattern Pattern matching all view elements whose content should be treated as raw data.
	 */
	public registerRawContentMatcher( pattern: MatcherPattern ): void {
		this.domConverter.registerRawContentMatcher( pattern );
	}

	/**
	 * If the processor is set to use marked fillers, it will insert `&nbsp;` fillers wrapped in `<span>` elements
	 * (`<span data-cke-filler="true">&nbsp;</span>`) instead of regular `&nbsp;` characters.
	 *
	 * This mode allows for a more precise handling of block fillers (so they do not leak into editor content) but
	 * bloats the editor data with additional markup.
	 *
	 * This mode may be required by some features and will be turned on by them automatically.
	 *
	 * @param type Whether to use the default or the marked `&nbsp;` block fillers.
	 */
	public useFillerType( type: 'default' | 'marked' ): void {
		this.domConverter.blockFillerMode = type == 'marked' ? 'markedNbsp' : 'nbsp';
	}

	/**
	 * Converts an XML string to its DOM representation. Returns a document fragment containing nodes parsed from
	 * the provided data.
	 */
	private _toDom( data: string ): DocumentFragment {
		// Stringify namespaces.
		const namespaces = this.namespaces.map( nsp => `xmlns:${ nsp }="nsp"` ).join( ' ' );

		// Wrap data into root element with optional namespace definitions.
		data = `<xml ${ namespaces }>${ data }</xml>`;

		const parsedDocument = this.domParser.parseFromString( data, 'text/xml' );

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
