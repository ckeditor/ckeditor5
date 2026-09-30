/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module markdown-gfm/html2markdown/html2markdown
 */

import { trustedHtml } from '@ckeditor/ckeditor5-utils';
import { unified, type Plugin, type Processor } from 'unified';
import rehypeRemark from 'rehype-remark';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import remarkStringify from 'remark-stringify';
import { visit } from 'unist-util-visit';
import { h } from 'hastscript';
import { toHtml } from 'hast-util-to-html';
import { fromDom } from 'hast-util-from-dom';
import type { Handle, State } from 'hast-util-to-mdast';
import type { Element, Node, Root } from 'hast';

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
			handlers[ tagName ] = ( state: State, node: Element ): any => {
				const tag = toHtml( h( node.tagName, node.properties ), {
					allowDangerousHtml: true,
					closeSelfClosing: true
				} );

				const endOfOpeningTagIndex = tag.indexOf( '>' );
				const openingTag = tag.slice( 0, endOfOpeningTagIndex + 1 );
				const closingTag = tag.slice( endOfOpeningTagIndex + 1 );

				return [
					{ type: 'html', value: openingTag },
					...state.all( node ),
					{ type: 'html', value: closingTag }
				];
			};
			return handlers;
		}, {} as Record<string, Handle> );
	}

	private _buildProcessor() {
		this._processor = unified()
			// Parse HTML to an abstract syntax tree (AST).
			.use( rehypeDomParse )
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
			// Serializes Markdown syntax tree to Markdown string.
			.use( remarkStringify, {
				resourceLink: true,
				emphasis: '_',
				rule: '-',
				handlers: {
					break: () => '\n'
				},
				unsafe: [
					{ character: '<' }
				]
			} );
	}
}

/**
 * Rehype plugin that parses the HTML here rather than with a third-party plugin, so that the string passes through
 * the Trusted Types policy of the editor.
 */
function rehypeDomParse( this: Processor ): void {
	this.parser = ( html: string ): Root => {
		const template = document.createElement( 'template' );

		template.innerHTML = trustedHtml( html );

		return fromDom( template.content ) as Root;
	};
}

/**
 * Removes `<label>` element from TODO lists, so that `<input>` and `text` are direct children of `<li>`.
 */
function removeLabelFromCheckboxes(): ReturnType<Plugin> {
	return function( tree: Node ): void {
		visit( tree, 'element', ( node: Element, index: number | null, parent: Root | Element ) => {
			if ( index !== null && node.tagName === 'label' && parent.type === 'element' && parent.tagName === 'li' ) {
				parent.children.splice( index, 1, ...node.children );
			}
		} );
	};
}
