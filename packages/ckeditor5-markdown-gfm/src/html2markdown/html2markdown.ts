/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module markdown-gfm/html2markdown/html2markdown
 */

import { unified } from 'unified';
import rehypeParse from 'rehype-dom-parse';
import rehypeRemark, { type Options } from 'rehype-remark';
import remarkGfm from 'remark-gfm-no-autolink';
import remarkStringify from 'remark-stringify';
import { toHtml } from 'hast-util-to-html';

export class HtmlToMarkdown {
	private _processor: any;
	private _keepRawTags: Array<string> = [];

	constructor() {
		this._buildProcessor();
	}

	public keep( tagName: string ): void {
		this._keepRawTags.push( tagName.toLowerCase() );
		this._buildProcessor();
	}

	public parse( html: string ): string {
		return this._processor
			.processSync( html )
			.toString()
			.trim();
	}

	public getRawTagsHandlers(): Options['handlers'] {
		return this._keepRawTags.reduce( ( handlers: any, tagName: any ) => {
			handlers[ tagName ] = ( state: any, node: any ) => {
				const result = {
					type: 'html',
					value: toHtml( node, { allowDangerousHtml: true } )
				};

				state.patch( node, result );
				return result;
			};

			return handlers;
		}, {} as Options['handlers'] );
	}

	private _buildProcessor() {
		this._processor = unified()
			.use( rehypeParse )
			.use( rehypeRemark, {
				handlers: this.getRawTagsHandlers()
			} )
			.use( remarkGfm, { singleTilde: false } )
			.use( remarkStringify, {
				emphasis: '_',
				rule: '-'
			} );
	}
}
