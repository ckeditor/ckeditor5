/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import MarkdownDataProcessor from '../../src/gfmdataprocessor';
import { stringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
import { testDataProcessor } from '../../tests/_utils/utils';
import ViewDocument from '@ckeditor/ckeditor5-engine/src/view/document';
import { StylesProcessor } from '@ckeditor/ckeditor5-engine/src/view/stylesmap';

const testCases = {
	'backslash': { test: '\\\\', result: '\\' },
	'underscore': { test: '\\_', result: '_' },
	'left brace': { test: '\\{', result: '{' },
	'right brace': { test: '\\}', result: '}' },
	'left bracket': { test: '\\[', result: '[' },
	'right bracket': { test: '\\]', result: ']' },
	'left paren': { test: '\\(', result: '(' },
	'right paren': { test: '\\)', result: ')' },
	'greater than': { test: '\\>', result: '>' },
	'hash': { test: '\\#', result: '#' },
	'period': { test: '\\.', result: '.' },
	'exclamation mark': { test: '\\!', result: '!' },
	'plus': { test: '\\+', result: '+' },
	'minus': { test: '\\-', result: '-' }
};

describe( 'GFMDataProcessor', () => {
	describe( 'escaping', () => {
		describe( 'toView', () => {
			let dataProcessor;

			beforeEach( () => {
				const viewDocument = new ViewDocument( new StylesProcessor() );
				dataProcessor = new MarkdownDataProcessor( viewDocument );
			} );

			for ( const key in testCases ) {
				const test = testCases[ key ].test;
				const result = testCases[ key ].result;

				it( `should escape ${ key }`, () => {
					const documentFragment = dataProcessor.toView( test );

					expect( stringify( documentFragment ) ).to.equal( `<p>${ result }</p>` );
				} );

				it( `should not escape ${ key } in code blocks`, () => {
					const documentFragment = dataProcessor.toView( `	${ test }` );

					expect( stringify( documentFragment ) ).to.equal( `<pre><code>${ test }</code></pre>` );
				} );

				it( `should not escape ${ key } in code spans`, () => {
					const documentFragment = dataProcessor.toView( '`' + test + '`' );

					expect( stringify( documentFragment ) ).to.equal( `<p><code>${ test }</code></p>` );
				} );
			}

			it( 'should escape backtick', () => {
				const documentFragment = dataProcessor.toView( '\\`' );

				expect( stringify( documentFragment ) ).to.equal( '<p>`</p>' );
			} );

			it( 'should not escape backtick in code blocks', () => {
				const documentFragment = dataProcessor.toView( '	\\`' );

				expect( stringify( documentFragment ) ).to.equal( '<pre><code>\\`</code></pre>' );
			} );
		} );

		describe( 'HTML', () => {
			// To note that the test util inlines entities in text nodes, hence the expected HTML in these tests
			// contain the raw characters but we "know" that those are text nodes and therefore should be converted
			// back to entities when outputting markdown.

			it( 'should escape <', () => {
				testDataProcessor( '\\<', '<p><</p>' );
			} );

			it( 'should escape HTML as text', () => {
				testDataProcessor( '\\<h1>Test\\</h1>', '<p><h1>Test</h1></p>' );
			} );

			it( 'should not escape \\< inside inline code', () => {
				testDataProcessor( '`\\<`', '<p><code>\\<</code></p>' );
			} );

			it( 'should not touch escape-like HTML inside code blocks', () => {
				testDataProcessor(
					'```\n' +
					'\\<h1>Test\\</h1>\n' +
					'```',
					'<pre><code>' +
					'\\<h1>Test\\</h1>' +
					'</code></pre>' );
			} );

			// Necessary test as we're overriding Turndown's escape(). Just to be sure.
			it( 'should still escape markdown characters', () => {
				testDataProcessor( '\\* \\_', '<p>* _</p>' );
			} );
		} );
	} );
} );
