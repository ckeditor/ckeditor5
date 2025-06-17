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
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
import { toHtml } from 'hast-util-to-html';
import type { Handle, State } from 'hast-util-to-mdast';
import type { Element, Node, Root, RootContent } from 'hast';

export class MarkdownGfmHtmlToMd {
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
		return this._processor!
			.processSync( html )
			.toString()
			.trim();
	}

	/**
	 * Returns handlers for raw HTML tags that should be kept in the Markdown output.
	 */
	private _getRawTagsHandlers(): Record<string, Handle> {
		return this._keepRawTags.reduce( ( handlers: Record<string, Handle>, tagName: string ) => {
			handlers[ tagName ] = ( state: State, node: RootContent ) => {
				const result = {
					type: 'html' as const,
					value: toHtml( node, { allowDangerousHtml: true } )
				};

				state.patch( node, result );

				return result;
			};

			return handlers;
		}, {} as Record<string, Handle> );
	}

	private _buildProcessor() {
		this._processor = unified()
			// Parse HTML to an abstract syntax tree (AST).
			.use( rehypeParse )
			// Removes `<label>` element from TODO lists.
			.use( removeLabelFromCheckboxes )
			// Turns HTML syntax tree into Markdown syntax tree.
			.use( rehypeRemark, {
				// Keeps allowed HTML tags.
				handlers: this._getRawTagsHandlers()
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
					break: () => '\n'
				}
			} );
	}
}

/**
 * Removes `<label>` element from TODO lists, so that `<input>` and `text` are direct children of `<li>`.
 */
function removeLabelFromCheckboxes(): ReturnType<Plugin> {
	return function( tree: Node ): void {
		visit( tree, 'element', ( node: Element, index: number, parent: Root | Element ) => {
			if ( node.tagName === 'label' && parent.type === 'element' && parent.tagName === 'li' ) {
				parent.children[ index ] = node.children[ 0 ];
				parent.children.splice( index + 1, 1, ...node.children );
			}
		} );
	};
}
