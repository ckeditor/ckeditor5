/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module markdown-gfm/markdown2html/markdown2html
 */

import { unified } from 'unified';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-dom-stringify';

/**
 * This is a helper class used by the {@link module:markdown-gfm/markdown Markdown feature} to convert Markdown to HTML.
 */
export class MarkdownToHtml {
	private _processor;

	constructor() {
		this._processor = unified()
			.use( remarkParse )
			.use( remarkGfm, { singleTilde: false } )
			.use( remarkRehype, { allowDangerousHtml: true } )
			.use( rehypeRaw )
			.use( rehypeStringify );
	}

	public parse( markdown: string ): string {
		return this._processor
			.processSync( markdown )
			.toString()
			.replaceAll( /\n<\/code>/g, '</code>' );
	}
}
