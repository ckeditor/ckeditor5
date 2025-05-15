/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module markdown-gfm/markdown2html/markdown2html
 */

import { marked } from 'marked';

/**
 * This is a helper class used by the {@link module:markdown-gfm/markdown Markdown feature} to convert Markdown to HTML.
 */
export class MarkdownToHtml {
	private _parser: typeof marked;

	private _options = {
		gfm: true,
		breaks: true,
		tables: true,
		xhtml: true,
		headerIds: false
	};

	constructor() {
		// Overrides.
		marked.use( {
			tokenizer: {
				// Disable the autolink rule in the lexer.
				autolink: () => null as any,
				url: () => null as any
			},
			renderer: {
				checkbox( ...args: Array<any> ) {
					// Remove bogus space after <input type="checkbox"> because it would be preserved
					// by DomConverter as it's next to an inline object.
					return Object.getPrototypeOf( this ).checkbox.call( this, ...args ).trimRight();
				},

				code( ...args: Array<any> ) {
					// Since marked v1.2.8, every <code> gets a trailing "\n" whether it originally
					// ended with one or not (see https://github.com/markedjs/marked/issues/1884 to learn why).
					// This results in a redundant soft break in the model when loaded into the editor, which
					// is best prevented at this stage. See https://github.com/ckeditor/ckeditor5/issues/11124.
					return Object.getPrototypeOf( this ).code.call( this, ...args ).replace( '\n</code>', '</code>' );
				}
			}
		} );

		this._parser = marked;
	}

	public parse( markdown: string ): string {
		return this._parser.parse( markdown, this._options );
	}
}
