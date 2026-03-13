/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { MarkdownGfmMdToHtml, DEFAULT_GFM_MD_TO_HTML_PLUGINS } from '../../src/markdown2html/markdown2html.js';

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
					...DEFAULT_GFM_MD_TO_HTML_PLUGINS,
					customPlugin
				}
			} );

			converter.parse( '# Hello' );

			expect( pluginCalled ).to.be.true;
		} );
	} );
} );

describe( 'DEFAULT_GFM_MD_TO_HTML_PLUGINS', () => {
	it( 'should load the default plugins', () => {
		expect( DEFAULT_GFM_MD_TO_HTML_PLUGINS ).to.have.keys( [
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
