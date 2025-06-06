/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module markdown-gfm/html2markdown/html2markdown
 */

import { unified } from 'unified';
import rehypeParse from 'rehype-dom-parse';
import rehypeRemark from 'rehype-remark';
import remarkGfm from 'remark-gfm-no-autolink';
import remarkStringify from 'remark-stringify';
import { toHtml } from 'hast-util-to-html';
import type { Handle as MarkdownHandle } from 'mdast-util-to-markdown';
import type { Handle as MdastHandle } from 'hast-util-to-mdast';

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

	public getRawTagsHandlers(): Record<string, MdastHandle> {
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
		}, {} as Record<string, MdastHandle> );
	}

	public getNodeHandlers(): MarkdownHandle {
		const urlPattern = [
			String.raw`\b(?:(?:https?|ftp):\/\/|www\.)`,
			String.raw`(?![-_])(?:[-_a-z0-9\u00a1-\uffff]{1,63}\.)+(?:[a-z\u00a1-\uffff]{2,63})`,
			String.raw`(?:[^\s<>]*)`
		].join( '' );

		const urlOrTextRegex = new RegExp( `(${ urlPattern })|([\\s\\S]+?)(?=(?:${ urlPattern })|$)`, 'gi' );

		return (
			node: { type: 'text'; value: string },
			_: any,
			state: any
		): string => {
			return node.value.replaceAll( urlOrTextRegex, ( match, urlChunk, textChunk ) => {
				return urlChunk || state.safe( textChunk, { before: '', after: '' } );
			} );
		};
	}

	private _buildProcessor() {
		this._processor = unified()
			.use( rehypeParse )
			.use( rehypeRemark, {
				handlers: this.getRawTagsHandlers()
			} )
			.use( remarkGfm, { singleTilde: true } )
			.use( remarkStringify, {
				emphasis: '_',
				rule: '-',
				handlers: {
					text: this.getNodeHandlers()
				}
			} );
	}
}
