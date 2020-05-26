/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module markdown-gfm/gfmdataprocessor
 */

import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';

import markdown2html from './markdown2html/markdown2html';
import html2markdown from './html2markdown/html2markdown';

/**
 * This data processor implementation uses GitHub Flavored Markdown as input/output data.
 *
 * See the {@glink features/markdown Markdown output} guide to learn more on how to enable it.
 *
 * @implements module:engine/dataprocessor/dataprocessor~DataProcessor
 */
export default class GFMDataProcessor {
	/**
	 * Creates a new instance of the Markdown data processor class.
	 *
	 * @param {module:engine/view/document~Document} document
	 */
	constructor( document ) {
		/**
		 * HTML data processor used to process HTML produced by the Markdown-to-HTML converter and the other way.
		 *
		 * @private
		 * @member {module:engine/dataprocessor/htmldataprocessor~HtmlDataProcessor}
		 */
		this._htmlDP = new HtmlDataProcessor( document );
	}

	/**
	 * Converts the provided Markdown string to view tree.
	 *
	 * @param {String} data A Markdown string.
	 * @returns {module:engine/view/documentfragment~DocumentFragment} The converted view element.
	 */
	toView( data ) {
		const html = markdown2html( data );
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
		return html2markdown( html );
	}
}
