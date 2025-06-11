/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module markdown-gfm/html2markdown/html2markdown
 */

import { unified, type Plugin } from 'unified';
import rehypeParse from 'rehype-dom-parse';
import rehypeRemark from 'rehype-remark';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm-no-autolink';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
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

	private getRawTagsHandlers(): Record<string, MdastHandle> {
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

	private getLinkHandler(): MarkdownHandle {
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
				if ( urlChunk ) {
					return urlChunk;
				}

				return state
					.safe( textChunk, { before: '', after: '' } )
					.replaceAll( /(?<!\\)</g, '\\<' );
			} );
		};
	}

	/**
	 * Removes `<label>` element from TODO lists, so that `<input>` and `text` are direct children of `<li>`.
	 */
	private removeLabelFromCheckboxes(): ReturnType<Plugin> {
		return function( tree ) {
			visit( tree, 'element', ( node: any, index: number, parent: any ) => {
				if ( node.tagName === 'label' && parent.tagName === 'li' ) {
					parent.children[ index ] = node.children[ 0 ];
					parent.children.splice( index + 1, 1, ...node.children );
				}
			} );
		};
	}

	private _buildProcessor() {
		this._processor = unified()
			// Parse HTML to an abstract syntax tree (AST).
			.use( rehypeParse )
			// Removes `<label>` element from TODO lists.
			.use( this.removeLabelFromCheckboxes )
			// Turns HTML syntax tree to markdown syntax tree.
			.use( rehypeRemark, {
				handlers: this.getRawTagsHandlers()
			} )
			// Adds support for GitHub Flavored Markdown (GFM).
			.use( remarkGfm, {
				singleTilde: true
			} )
			// Replaces line breaks with `<br>` tags.
			.use( remarkBreaks )
			// Serializes HTML syntax tree.
			.use( remarkStringify, {
				resourceLink: true,
				emphasis: '_',
				rule: '-',
				handlers: {
					break: () => '\n',
					text: this.getLinkHandler()
				}
			} );
	}
}
