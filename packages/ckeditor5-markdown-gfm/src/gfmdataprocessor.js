/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module markdown-gfm/gfmdataprocessor
 */

import marked from './lib/marked/marked';
import toMarkdown from './lib/to-markdown/to-markdown';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import GFMRenderer from './lib/marked/renderer';
import converters from './lib/to-markdown/converters';

/**
 * This data processor implementation uses GitHub Flavored Markdown as input/output data.
 *
 * @implements module:engine/dataprocessor/dataprocessor~DataProcessor
 */
export default class GFMDataProcessor {
	constructor() {
		/**
		 * HTML data processor used to process HTML produced by the Markdown-to-HTML converter and the other way.
		 *
		 * @private
		 * @member {module:engine/dataprocessor/htmldataprocessor~HtmlDataProcessor}
		 */
		this._htmlDP = new HtmlDataProcessor();
	}

	/**
	 * Converts the provided Markdown string to view tree.
	 *
	 * @param {String} data A Markdown string.
	 * @returns {module:engine/view/documentfragment~DocumentFragment} The converted view element.
	 */
	toView( data ) {
		const html = marked.parse( data, {
			gfm: true,
			breaks: true,
			tables: true,
			xhtml: true,
			renderer: new GFMRenderer()
		} );

		return this._htmlDP.toView( html );
	}

	/**
	 * Converts the provided {@link module:engine/view/documentfragment~DocumentFragment} to data format &mdash; in this
	 * case to a Markdown string.
	 *
	 * @param {module:engine/view/documentfragment~DocumentFragment} viewFragment
	 * @returns {String} Markdown string.
	 */
	toData( viewFragment ) {
		const html = this._htmlDP.toData( viewFragment );

		return toMarkdown( html, { gfm: true, converters } );
	}
}

