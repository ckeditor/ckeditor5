/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
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
		 * @member {DOMParser}
		 */
		this.domParser = new DOMParser();

		/**
		 * A DOM converter used to convert DOM elements to view elements.
		 *
		 * @member {module:engine/view/domconverter~DomConverter}
		 */
		this.domConverter = new DomConverter( document, { renderingMode: 'data' } );

		/**
		 * A basic HTML writer instance used to convert DOM elements to an HTML string.
		 *
		 * @member {module:engine/dataprocessor/htmlwriter~HtmlWriter}
		 */
		this.htmlWriter = new BasicHtmlWriter();
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
		const domFragment = this.domConverter.viewToDom( viewFragment, document );

		// Convert DOM DocumentFragment to HTML output.
		return this.htmlWriter.getHtml( domFragment );
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
		return this.domConverter.domToView( domFragment );
	}

	/**
	 * Registers a {@link module:engine/view/matcher~MatcherPattern} for view elements whose content should be treated as raw data
	 * and not processed during the conversion from the DOM to the view elements.
	 *
	 * The raw data can be later accessed by a
	 * {@link module:engine/view/element~Element#getCustomProperty custom property of a view element} called `"$rawContent"`.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} pattern Pattern matching all view elements whose content should
	 * be treated as raw data.
	 */
	registerRawContentMatcher( pattern ) {
		this.domConverter.registerRawContentMatcher( pattern );
	}

	/**
	 * If the processor is set to use marked fillers, it will insert `&nbsp;` fillers wrapped in `<span>` elements
	 * (`<span data-cke-filler="true">&nbsp;</span>`) instead of regular `&nbsp;` characters.
	 *
	 * This mode allows for a more precise handling of the block fillers (so they do not leak into the editor content) but
	 * bloats the editor data with additional markup.
	 *
	 * This mode may be required by some features and will be turned on by them automatically.
	 *
	 * @param {'default'|'marked'} type Whether to use the default or the marked `&nbsp;` block fillers.
	 */
	useFillerType( type ) {
		this.domConverter.blockFillerMode = type == 'marked' ? 'markedNbsp' : 'nbsp';
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
		// Wrap data with a <body> tag so leading non-layout nodes (like <script>, <style>, HTML comment)
		// will be preserved in the body collection.
		// Do it only for data that is not a full HTML document.
		if ( !data.match( /<(?:html|body|head|meta)(?:\s[^>]*)?>/i ) ) {
			data = `<body>${ data }</body>`;
		}

		const document = this.domParser.parseFromString( data, 'text/html' );
		const fragment = document.createDocumentFragment();
		const bodyChildNodes = document.body.childNodes;

		while ( bodyChildNodes.length > 0 ) {
			fragment.appendChild( bodyChildNodes[ 0 ] );
		}

		return fragment;
	}
}
