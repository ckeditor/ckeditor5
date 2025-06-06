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
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';

export class HtmlToMarkdown {
	private _processor: any;
	private _keepRawTags = new Set<string>();

	constructor() {
		this._buildProcessor();
	}

	public keep( tagName: string ): void {
		this._keepRawTags.add( tagName.toLowerCase() );
		this._buildProcessor();
	}

	public parse( html: string ): string {
		return this._processor
			.processSync( html )
			.toString()
			.trim();
	}

	private _buildProcessor() {
		const rehypeKeep = () => {
			return ( tree: any ) => {
				visit( tree, 'element', ( node: any ) => {
					if ( this._keepRawTags.has( node.tagName ) ) {
						node.data = node.data || {};
						node.data.hName = node.tagName;
						node.data.hProperties = node.properties;
						node.data.hChildren = node.children;
					}
				} );
			};
		};

		this._processor = unified()
			.use( rehypeParse )
			.use( rehypeKeep )
			.use( rehypeRemark )
			.use( remarkGfm, { singleTilde: false } )
			.use( remarkStringify, {
				emphasis: '_',
				rule: '-'
			} );
	}
}
