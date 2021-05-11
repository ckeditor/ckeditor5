/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
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
		 * A regular expression used to check whether the MIME type of <script> elements matches one of the JavaScript mimetypes.
		 * See {@link https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types#javascript_types} and
		 * {@link https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-type}
		 *
		 * @private
		 * @member {RegExp}
		 */
		this._jsTypeRegex = new RegExp( [
			'^((((application\\/(x-)?(ecm|jav)ascript)',
			'|(text\\/((javascript1\\.[0-5])|((((x-)?(ecm|jav)a)|j|live)script))))\\s*(;.*)?)',
			'|module)$'
		].join( '' ) );

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

		/** */
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
		this._domConverter.registerRawContentMatcher( pattern );
	}

	/**
	 * If the processor is set to use marked fillers, it will insert `&nbsp;` fillers wrapped in `<span>` elements
	 * (`<span data-cke-filler="true">&nbsp;</span>`) instead of regular `&nbsp;` characters.
	 *
	 * This mode allows for more precise handling of block fillers (so they do not leak into the editor content) but bloats the
	 * editor data with additional markup.
	 *
	 * This mode may be required by some features and will be turned on by them automatically.
	 *
	 * @param {'default'|'marked'} type Whether to use the default or marked `&nbsp;` block fillers.
	 */
	useFillerType( type ) {
		this._domConverter.blockFillerMode = type == 'marked' ? 'markedNbsp' : 'nbsp';
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
		const headNodes = document.head.childNodes;
		const bodyNodes = document.body.childNodes;

		// We need to check if there are <script> elements in the <head> that should be in the <body> (see issue #9659).
		// We aren't going to reimplement DOMParser, so short of that we use some heuristics to determine whether to add any
		// <script> elements from the <head> into the final DocumentFragment we return.
		const firstHeadNode = headNodes[ 0 ];

		// If there is nothing in the <head>, don't bother with further checks
		if ( firstHeadNode !== undefined ) {
			// Copy-pasted HTML sometimes comes with a <meta> tag up top. We ignore this for subsequent processing
			const headNodeStartIdx = ( firstHeadNode.nodeName.toLowerCase() === 'meta' ) ? 1 : 0;
			let useHeadNodes = true;

			// Check each node in the <head> other than the starting <meta>.
			// If any of them is either not a <script> tag, or if the mimetype matches one of the JS mimetypes,
			// then it probably belongs in the <head>, right where the DOMParser put it.
			// If such an element is present, we trust that DOMParser did the right thing after all,
			// so we break and don't add any children of <head> to the DocumentFragment
			for ( let nodeIdx = headNodeStartIdx; nodeIdx < headNodes.length; nodeIdx++ ) {
				const node = headNodes[ nodeIdx ];
				if (
					node.nodeName.toLowerCase() !== 'script' ||
					!node.type ||
					this._jsTypeRegex.test( node.type.toLowerCase() )
				) {
					useHeadNodes = false;
					break;
				}
			}

			// If we've determined that some of the <script> tags from the <head> belong in the final DocumentFragment,
			// put them there
			if ( useHeadNodes ) {
				while ( headNodes.length > headNodeStartIdx ) {
					fragment.appendChild( headNodes[ headNodeStartIdx ] );
				}
			}
		}

		// Add nodes from the <body> to the DocumentFragment.
		while ( bodyNodes.length > 0 ) {
			fragment.appendChild( bodyNodes[ 0 ] );
		}

		return fragment;
	}
}
