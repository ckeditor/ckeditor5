/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module markdown-gfm/markdown2html/markdown2html
 */

import { unified, type Plugin, type Pluggable } from 'unified';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkBreaks from 'remark-breaks';
import rehypeStringify from 'rehype-dom-stringify';
import { visit } from 'unist-util-visit';
import { toHtml } from 'hast-util-to-html';
import { fromDom } from 'hast-util-from-dom';
import type { Element, Node, Root, RootContent } from 'hast';

/**
 * The default `unified()` plugin chain used by {@link module:markdown-gfm/markdown2html/markdown2html~MarkdownGfmMdToHtml}.
 * This object is frozen and must not be mutated. Pass a copy to the constructor if you need to customize the plugin chain.
 *
 * Learn more about the `unified()` plugin chain in the [unified](https://github.com/unifiedjs/unified) documentation.
 */
export const MarkdownGfmMdToHtmlDefaultPlugins: Readonly<Record<string, Pluggable>> = Object.freeze( {
	// Parses Markdown to an abstract syntax tree (AST).
	remarkParse,
	// Adds support for GitHub Flavored Markdown (GFM).
	remarkGfm: [ remarkGfm, { singleTilde: true } ],
	// Replaces line breaks with `<br>` tags.
	remarkBreaks,
	// Turns markdown syntax tree to HTML syntax tree, ignoring embedded HTML.
	remarkRehype: [ remarkRehype, { allowDangerousHtml: true } ],
	// Handles HTML embedded in Markdown.
	rehypeDomRaw,
	// Removes classes from list elements.
	deleteClassesFromToDoLists,
	// Serializes HTML syntax tree to HTML string.
	rehypeStringify
} );

/**
 * This is a helper class used by the {@link module:markdown-gfm/markdown Markdown feature} to convert Markdown to HTML.
 */
export class MarkdownGfmMdToHtml {
	private _processor;

	/**
	 * Creates a new instance of MarkdownGfmMdToHtml.
	 * @param {Object} options - The options for the MarkdownGfmMdToHtml instance.
	 * @param {Record<string, Pluggable>} options.plugins - The plugins to be used by the `unified().use()` processor for converting
	 * Markdown to HTML. By default, {@link MarkdownGfmMdToHtmlDefaultPlugins} is used. You can override the defaults by passing your
	 * own plugins.
	 *
	 * Learn more about the `unified()` plugin chain in the [unified](https://github.com/unifiedjs/unified) documentation.
	 */
	constructor( { plugins = MarkdownGfmMdToHtmlDefaultPlugins }: { plugins?: Record<string, Pluggable> } = {} ) {
		this._processor = unified().use( {
			plugins: Object.values( plugins )
		} );
	}

	public parse( markdown: string ): string {
		return this._processor
			.processSync( markdown )
			.toString()
			.replaceAll( '\n</code>', '</code>' );
	}
}

/**
 * Rehype plugin that improves handling of the To-do lists by removing:
 *  * default classes added to `<ul>`, `<ol>`, and `<li>` elements.
 *  * bogus space after <input type="checkbox"> because it would be preserved by ViewDomConverter as it's next to an inline object.
 */
function deleteClassesFromToDoLists(): ReturnType<Plugin> {
	return ( tree: Node ): void => {
		visit( tree, 'element', ( node: Element ) => {
			if ( node.tagName === 'ul' || node.tagName === 'ol' || node.tagName === 'li' ) {
				node.children = node.children.filter( child => child.type !== 'text' || !!child.value.trim() );
				delete node.properties.className;
			}
		} );
	};
}

/**
 * Rehype plugin to parse raw HTML nodes inside Markdown. This plugin is used instead of `rehype-raw` or `rehype-stringify`,
 * because those plugins rely on `parse5` DOM parser which is heavy and redundant in the browser environment where we can
 * use the native DOM APIs.
 *
 * This plugins finds any node (root or element) whose children include `raw` nodes and reparses them like so:
 * 1. Serializes its children to an HTML string.
 * 2. Reparses the HTML string using a `<template>` element.
 * 3. Converts each parsed DOM node back into HAST nodes.
 * 4. Replaces the original children with the newly created HAST nodes.
 */
function rehypeDomRaw(): ReturnType<Plugin> {
	return ( tree: Node ): void => {
		visit( tree, [ 'root', 'element' ], ( node: Node | Element ) => {
			/* istanbul ignore next -- @preserve */
			if ( !isNodeRootOrElement( node ) ) {
				return;
			}

			// Only act on nodes with at least one raw child.
			if ( !node.children.some( child => child.type === 'raw' ) ) {
				return;
			}

			const template = document.createElement( 'template' );

			// Serialize all children to an HTML fragment.
			template.innerHTML = toHtml(
				{ type: 'root', children: node.children },
				{ allowDangerousHtml: true }
			);

			// Convert each parsed DOM node back into HAST and replace the original children.
			node.children = Array
				.from( template.content.childNodes )
				.map( domNode => fromDom( domNode ) as RootContent );
		} );
	};
}

/**
 * Only needed for the type guard.
 */
function isNodeRootOrElement( node: any ): node is Root | Element {
	return ( node.type === 'root' || node.type === 'element' ) && node.children;
}
