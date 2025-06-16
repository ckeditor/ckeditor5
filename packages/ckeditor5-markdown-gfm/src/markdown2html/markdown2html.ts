/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module markdown-gfm/markdown2html/markdown2html
 */

import { unified, type Plugin } from 'unified';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import remarkBreaks from 'remark-breaks';
import rehypeStringify from 'rehype-dom-stringify';
import { visit } from 'unist-util-visit';
import { toHtml } from 'hast-util-to-html';
import { fromDom } from 'hast-util-from-dom';
import type { Element, Root, RootContent } from 'hast';

/**
 * This is a helper class used by the {@link module:markdown-gfm/markdown Markdown feature} to convert Markdown to HTML.
 */
export class MarkdownGfmMdToHtml {
	private _processor;

	constructor() {
		this._processor = unified()
			// Parses Markdown to an abstract syntax tree (AST).
			.use( remarkParse )
			// Adds support for GitHub Flavored Markdown (GFM).
			.use( remarkGfm, { singleTilde: true } )
			// Replaces line breaks with `<br>` tags.
			.use( remarkBreaks )
			// Turns markdown syntax tree to HTML syntax tree, ignoring embedded HTML.
			.use( remarkRehype, { allowDangerousHtml: true } )
			// Handles HTML embedded in Markdown.
			.use( rehypeDomRaw )
			// Removes classes from list elements.
			.use( this._deleteClassesFromToDoLists )
			// Serializes HTML syntax tree
			.use( rehypeStringify );
	}

	public parse( markdown: string ): string {
		return this._processor
			.processSync( markdown )
			.toString()
			.replaceAll( '\n</code>', '</code>' );
	}

	/**
	 * Removes default classes added to `<ul>`, `<ol>`, and `<li>` elements.
	 */
	private _deleteClassesFromToDoLists(): ReturnType<Plugin> {
		return function( tree ) {
			visit( tree, 'element', ( node: any ) => {
				if ( node.tagName === 'ul' || node.tagName === 'ol' || node.tagName === 'li' ) {
					delete node.properties.className;
				}
			} );
		};
	}
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
function rehypeDomRaw() {
	return ( tree: Root ): void => {
		visit( tree, [ 'root', 'element' ], node => {
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
