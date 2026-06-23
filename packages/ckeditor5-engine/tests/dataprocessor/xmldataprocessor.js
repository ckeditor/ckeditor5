/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { XmlDataProcessor } from '../../src/dataprocessor/xmldataprocessor.js';
import { BasicHtmlWriter } from '../../src/dataprocessor/basichtmlwriter.js';
import { ViewDomConverter } from '../../src/view/domconverter.js';
import { xssTemplates } from '../../tests/dataprocessor/_utils/xsstemplates.js';
import { ViewDocumentFragment } from '../../src/view/documentfragment.js';
import { ViewDocument } from '../../src/view/document.js';
import { _stringifyView, _parseView } from '../../src/dev-utils/view.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';

describe( 'XmlDataProcessor', () => {
	let dataProcessor, viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		dataProcessor = new XmlDataProcessor( viewDocument );
	} );

	describe( 'constructor', () => {
		it( 'should set public properties', () => {
			expect( dataProcessor ).toHaveProperty( 'namespaces' );
			expect( dataProcessor ).toHaveProperty( 'domParser' );
			expect( dataProcessor ).toHaveProperty( 'domConverter' );
			expect( dataProcessor ).toHaveProperty( 'htmlWriter' );
			expect( dataProcessor ).toHaveProperty( 'skipComments' );

			expect( dataProcessor.namespaces ).toBeInstanceOf( Array );
			expect( dataProcessor.domParser ).toBeInstanceOf( DOMParser );
			expect( dataProcessor.domConverter ).toBeInstanceOf( ViewDomConverter );
			expect( dataProcessor.htmlWriter ).toBeInstanceOf( BasicHtmlWriter );
			expect( dataProcessor.skipComments ).toBe( true );
		} );
	} );

	describe( 'toView', () => {
		it( 'should return empty DocumentFragment when empty string is passed', () => {
			const fragment = dataProcessor.toView( '' );
			expect( fragment ).toBeInstanceOf( ViewDocumentFragment );
			expect( fragment.childCount ).toBe( 0 );
		} );

		it( 'should convert XML to DocumentFragment with single text node', () => {
			const fragment = dataProcessor.toView( 'foo bar' );

			expect( _stringifyView( fragment ) ).toBe( 'foo bar' );
		} );

		it( 'should convert HTML to DocumentFragment with multiple child nodes', () => {
			const fragment = dataProcessor.toView( '<p>foo</p><p>bar</p>' );

			expect( _stringifyView( fragment ) ).toBe( '<p>foo</p><p>bar</p>' );
		} );

		it( 'should not add any additional nodes', () => {
			const fragment = dataProcessor.toView( 'foo <b>bar</b> text' );

			expect( _stringifyView( fragment ) ).toBe( 'foo <b>bar</b> text' );
		} );

		it( 'should allow to use registered namespaces', () => {
			dataProcessor = new XmlDataProcessor( viewDocument, {
				namespaces: [ 'foo', 'bar' ]
			} );

			const fragment = dataProcessor.toView( '<foo:a><bar:b></bar:b></foo:a><bar:b><foo:a></foo:a></bar:b>' );

			expect( _stringifyView( fragment ) ).toBe( '<foo:a><bar:b></bar:b></foo:a><bar:b><foo:a></foo:a></bar:b>' );
		} );

		it( 'should throw an error when use not registered namespaces', () => {
			expect( () => {
				dataProcessor.toView( '<foo:a></foo:a>' );
			} ).toThrow( /Parse error/ );
		} );

		it( 'should thrown an error when markup is invalid', () => {
			expect( () => {
				dataProcessor.toView( '<b>missing closing tag' );
			} ).toThrow( /Parse error/ );
		} );

		// Test against XSS attacks.
		for ( const name in xssTemplates ) {
			const input = xssTemplates[ name ].replace( /%xss%/g, 'testXss()' );

			it( 'should prevent XSS attacks: ' + name, () => new Promise( resolve => {
				window.testXss = vi.fn();
				dataProcessor.toView( input );

				window.setTimeout( () => {
					expect( window.testXss ).not.toHaveBeenCalled();
					resolve();
				}, 10 );
			} ) );
		}
	} );

	describe( 'toData', () => {
		it( 'should return empty string when empty DocumentFragment is passed', () => {
			const fragment = new ViewDocumentFragment( viewDocument );

			expect( dataProcessor.toData( fragment ) ).toBe( '' );
		} );

		it( 'should return text if document fragment with single text node is passed', () => {
			const fragment = new ViewDocumentFragment( viewDocument );
			fragment._appendChild( _parseView( 'foo bar' ) );

			expect( dataProcessor.toData( fragment ) ).toBe( 'foo bar' );
		} );

		it( 'should convert HTML to DocumentFragment with multiple child nodes', () => {
			const fragment = _parseView( '<p>foo</p><p>bar</p>' );

			expect( dataProcessor.toData( fragment ) ).toBe( '<p>foo</p><p>bar</p>' );
		} );
	} );

	describe( 'registerRawContentMatcher()', () => {
		it( 'should handle elements matching to MatcherPattern as elements with raw content', () => {
			dataProcessor.registerRawContentMatcher( { name: 'div', classes: 'raw' } );

			const fragment = dataProcessor.toView(
				'<p>foo</p>' +
				'<div class="raw">' +
					'<!-- 123 -->' +
					' abc ' +
					'<!-- 456 -->' +
				'</div>' +
				'<p>bar</p>'
			);

			expect( _stringifyView( fragment ) ).toBe( '<p>foo</p><div class="raw"></div><p>bar</p>' );
			expect( fragment.getChild( 1 ).getCustomProperty( '$rawContent' ) ).toBe( '<!-- 123 --> abc <!-- 456 -->' );
		} );
	} );

	describe( 'useFillerType()', () => {
		it( 'should turn on and off using marked block fillers', () => {
			const fragment = _parseView( '<container:p></container:p>' );

			expect( dataProcessor.toData( fragment ) ).toBe( '<p>&nbsp;</p>' );

			dataProcessor.useFillerType( 'marked' );

			expect( dataProcessor.toData( fragment ) ).toBe( '<p><span data-cke-filler="true">&nbsp;</span></p>' );

			dataProcessor.useFillerType( 'default' );

			expect( dataProcessor.toData( fragment ) ).toBe( '<p>&nbsp;</p>' );
		} );
	} );

	describe( 'skipComments', () => {
		it( 'should skip comments when `true`', () => {
			const fragment = dataProcessor.toView(
				'<!-- Comment 1 -->' +
				'<foo>' +
					'bar' +
					'<!-- Comment 2 -->' +
					'baz' +
				'</foo>' +
				'<!-- Comment 3 -->'
			);

			expect( _stringifyView( fragment ) ).toBe( '<foo>barbaz</foo>' );
		} );

		it( 'should preserve comments when `false`', () => {
			dataProcessor.skipComments = false;

			const fragment = dataProcessor.toView(
				'<!-- Comment 1 -->' +
				'<foo>' +
					'bar' +
					'<!-- Comment 2 -->' +
					'baz' +
				'</foo>' +
				'<!-- Comment 3 -->'
			);

			expect(
				_stringifyView( fragment )
			).toBe( '<$comment></$comment><foo>bar<$comment></$comment>baz</foo><$comment></$comment>' );
		} );
	} );
} );
