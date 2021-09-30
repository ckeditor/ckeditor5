/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module markdown-gfm/gfmdataprocessor
 */

import { HtmlDataProcessor } from 'ckeditor5/src/engine';
import escape from 'lodash-es/escape';

import markdown2html from './markdown2html/markdown2html';
import html2markdown, { turndownService } from './html2markdown/html2markdown';

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
	constructor( document, { mentionIdToText } ) {
		/**
		 * HTML data processor used to process HTML produced by the Markdown-to-HTML converter and the other way.
		 *
		 * @private
		 * @member {module:engine/dataprocessor/htmldataprocessor~HtmlDataProcessor}
		 */
		this._htmlDP = new HtmlDataProcessor( document );

		this.mentionIdToText = mentionIdToText;
	}

	/**
	 * Keeps the specified element in the output as HTML. This is useful if the editor contains
	 * features producing HTML that is not a part of the Markdown standard.
	 *
	 * By default, all HTML tags are removed.
	 *
	 * @param element {String} The element name to be kept.
	 */
	keepHtml( element ) {
		turndownService.keep( [ element ] );
	}

	/**
	 * Converts the provided Markdown string to a view tree.
	 *
	 * @param {String} data A Markdown string.
	 * @returns {module:engine/view/documentfragment~DocumentFragment} The converted view element.
	 */
	toView( data ) {
		const html = markdown2html( data );

		// Converts `@:5f7e99c932cb8c00061b87d9:` to `<span class="mention" data-mention="@5f7e99c932cb8c00061b87d9">@Patrick Star</span>`
		const htmlWithMentions = html.replace(
			/@:([0-9a-fA-F]{24}):/g,
			( match, id ) => `<span class="mention" data-mention="@${ id }">@${
				escape( typeof this.mentionIdToText === 'function' ? this.mentionIdToText( id ) : id )
			}</span>`
		);

		return this._htmlDP.toView( htmlWithMentions );
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

		// Converts `<span class="mention" data-mention="@5f7e99c932cb8c00061b87d9">@Patrick Star</span>` to `@:5f7e99c932cb8c00061b87d9:`
		// See https://github.com/taskworld/ckeditor5/blob/84700cd93725130eb28abc1657b058a62b1d662d/packages/ckeditor5-mention/src/mentionediting.js#L140-L141
		const parser = new window.DOMParser();
		const holder = parser.parseFromString( html, 'text/html' );
		const walker = holder.createTreeWalker(
			holder.body,
			window.NodeFilter.SHOW_ELEMENT,
			{
				acceptNode: node =>
					( node.classList.contains( 'mention' ) && node.getAttribute( 'data-mention' ) ) ?
						window.NodeFilter.FILTER_ACCEPT : window.NodeFilter.FILTER_SKIP
			}
		);
		let node;
		while ( true ) {
			node = walker.nextNode();
			if ( node === null ) {
				break;
			}

			// See https://github.com/taskworld/tw-backend/blob/2c30299fe57fd41a43ca4990377b8503a23266c8/app/legacy/api/message-service/MentionExtractor.ts#L9
			node.innerText = '@:' + node.getAttribute( 'data-mention' ).replace( /^@/, '' ) + ':';
		}

		return html2markdown( holder.body.innerHTML );
	}

	/**
	 * Registers a {@link module:engine/view/matcher~MatcherPattern} for view elements whose content should be treated as raw data
	 * and not processed during the conversion from Markdown to view elements.
	 *
	 * The raw data can be later accessed by a
	 * {@link module:engine/view/element~Element#getCustomProperty custom property of a view element} called `"$rawContent"`.
	 *
	 * @param {module:engine/view/matcher~MatcherPattern} pattern The pattern matching all view elements whose content should
	 * be treated as raw data.
	 */
	registerRawContentMatcher( pattern ) {
		this._htmlDP.registerRawContentMatcher( pattern );
	}

	/**
	 * This method does not have any effect on the data processor result. It exists for compatibility with the
	 * {@link module:engine/dataprocessor/dataprocessor~DataProcessor `DataProcessor` interface}.
	 */
	useFillerType() { }
}
