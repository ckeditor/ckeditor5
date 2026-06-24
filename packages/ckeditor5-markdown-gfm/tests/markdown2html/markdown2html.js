/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { MarkdownGfmMdToHtml, MarkdownGfmMdToHtmlDefaultPlugins } from '../../src/markdown2html/markdown2html.js';

describe( 'MarkdownGfmMdToHtml', () => {
	describe( 'constructor', () => {
		it( 'should allow for loading custom plugins', () => {
			let pluginCalled = false;

			function customPlugin() {
				return tree => {
					pluginCalled = true;
					return tree;
				};
			}

			const converter = new MarkdownGfmMdToHtml( {
				plugins: {
					...MarkdownGfmMdToHtmlDefaultPlugins,
					customPlugin
				}
			} );

			converter.parse( '# Hello' );

			expect( pluginCalled ).toBe( true );
		} );
	} );
} );

describe( 'MarkdownGfmMdToHtmlDefaultPlugins', () => {
	it( 'should load the default plugins', () => {
		expect( Object.keys( MarkdownGfmMdToHtmlDefaultPlugins ) ).toEqual( [
			'remarkParse',
			'remarkGfm',
			'remarkBreaks',
			'remarkRehype',
			'rehypeDomRaw',
			'deleteClassesFromToDoLists',
			'rehypeStringify'
		] );
	} );
} );
