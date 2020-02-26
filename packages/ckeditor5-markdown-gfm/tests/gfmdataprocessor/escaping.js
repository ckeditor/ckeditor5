/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import MarkdownDataProcessor from '../../src/gfmdataprocessor';
import { stringify } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';
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
	'peroid': { test: '\\.', result: '.' },
	'exclamation mark': { test: '\\!', result: '!' },
	'plus': { test: '\\+', result: '+' },
	'minus': { test: '\\-', result: '-' }
};

describe( 'GFMDataProcessor', () => {
	let dataProcessor;

	beforeEach( () => {
		const viewDocument = new ViewDocument( new StylesProcessor() );
		dataProcessor = new MarkdownDataProcessor( viewDocument );
	} );

	describe( 'escaping', () => {
		describe( 'toView', () => {
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
	} );
} );
