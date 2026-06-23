/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { HtmlDataProcessor } from '../../src/dataprocessor/htmldataprocessor.js';
import { BasicHtmlWriter } from '../../src/dataprocessor/basichtmlwriter.js';
import { ViewDomConverter } from '../../src/view/domconverter.js';
import { xssTemplates } from '../../tests/dataprocessor/_utils/xsstemplates.js';
import { ViewDocumentFragment } from '../../src/view/documentfragment.js';
import { _parseView, _stringifyView } from '../../src/dev-utils/view.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import { ViewDocument } from '../../src/view/document.js';

describe( 'HtmlDataProcessor', () => {
	let dataProcessor, viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		dataProcessor = new HtmlDataProcessor( viewDocument );
	} );

	describe( 'constructor', () => {
		it( 'should set public properties', () => {
			expect( dataProcessor ).toHaveProperty( 'domParser' );
			expect( dataProcessor ).toHaveProperty( 'domConverter' );
			expect( dataProcessor ).toHaveProperty( 'htmlWriter' );
			expect( dataProcessor ).toHaveProperty( 'skipComments' );

			expect( dataProcessor.domParser ).toBeInstanceOf( DOMParser );
			expect( dataProcessor.domConverter ).toBeInstanceOf( ViewDomConverter );
			expect( dataProcessor.htmlWriter ).toBeInstanceOf( BasicHtmlWriter );
			expect( dataProcessor.skipComments ).toBe( true );
		} );
	} );

	describe( 'toView()', () => {
		it( 'should return empty DocumentFragment when empty string is passed', () => {
			const fragment = dataProcessor.toView( '' );
			expect( fragment ).toBeInstanceOf( ViewDocumentFragment );
			expect( fragment.childCount ).toBe( 0 );
		} );

		it( 'should convert HTML to DocumentFragment with single text node', () => {
			const fragment = dataProcessor.toView( 'foo bar' );

			expect( _stringifyView( fragment ) ).toBe( 'foo bar' );
		} );

		it( 'should convert HTML to DocumentFragment with multiple child nodes', () => {
			const fragment = dataProcessor.toView( '<p>foo</p><p>bar</p>' );

			expect( _stringifyView( fragment ) ).toBe( '<p>foo</p><p>bar</p>' );
		} );

		it( 'should return only elements inside body tag', () => {
			const fragment = dataProcessor.toView( '<html><head></head><body><p>foo</p></body></html>' );

			expect( _stringifyView( fragment ) ).toBe( '<p>foo</p>' );
		} );

		it( 'should not add any additional nodes', () => {
			const fragment = dataProcessor.toView( 'foo <b>bar</b> text' );

			expect( _stringifyView( fragment ) ).toBe( 'foo <b>bar</b> text' );
		} );

		// Test against XSS attacks.
		for ( const name in xssTemplates ) {
			const input = xssTemplates[ name ].replace( /%xss%/g, 'testXss()' );

			it( 'should prevent XSS attacks: ' + name, () => new Promise( resolve => {
				window.testXss = vi.fn();
				dataProcessor.toView( input );

				setTimeout( () => {
					expect( window.testXss ).not.toHaveBeenCalled();
					resolve();
				}, 10 );
			} ) );
		}

		describe( 'https://github.com/ckeditor/ckeditor5-clipboard/issues/2#issuecomment-310417731 + #404', () => {
			it( 'does not lose whitespaces in Chrome\'s paste-like content', () => {
				const fragment = dataProcessor.toView(
					'<meta charset=\'utf-8\'>' +
					'<span>This is the<span>\u00a0</span></span>' +
					'<a href="url">third developer preview</a>' +
					'<span><span>\u00a0</span>of<span>\u00a0</span></span>' +
					'<strong>CKEditor\u00a05</strong>' +
					'<span>.</span>'
				);

				expect( _stringifyView( fragment ) ).toBe( '<span>This is the<span>\u00a0</span></span>' +
					'<a href="url">third developer preview</a>' +
					'<span><span>\u00a0</span>of<span>\u00a0</span></span>' +
					'<strong>CKEditor\u00a05</strong>' +
					'<span>.</span>'
				);

				// Just to be sure... _stringifyView() uses conversion and the browser extensively,
				// so it's not entirely safe.
				expect( fragment.getChild( 0 ).getChild( 1 ).getChild( 0 ).data ).toBe( '\u00a0' );
				expect( fragment.getChild( 2 ).getChild( 0 ).getChild( 0 ).data ).toBe( '\u00a0' );
				expect( fragment.getChild( 2 ).getChild( 2 ).getChild( 0 ).data ).toBe( '\u00a0' );
			} );
		} );
	} );

	describe( '_toDom()', () => {
		describe( 'HTML fragment without document structure', () => {
			it( 'should insert nested comment nodes into <body> collection', () => {
				const bodyDocumentFragment = dataProcessor._toDom(
					'<div>' +
						'<!-- Comment 1 -->' +
						'<p>' +
							'<!-- Comment 2 -->' +
							'Paragraph' +
							'<!-- Comment 3 -->' +
						'</p>' +
						'<!-- Comment 4 -->' +
					'</div>'
				);

				const [ div ] = bodyDocumentFragment.childNodes;
				const [ comment1, paragraph, comment4 ] = div.childNodes;
				const [ comment2, text, comment3 ] = paragraph.childNodes;

				expect( bodyDocumentFragment.childNodes.length ).toBe( 1 );
				expect( div.childNodes.length ).toBe( 3 );
				expect( paragraph.childNodes.length ).toBe( 3 );

				expect( comment1.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment1.data ).toBe( ' Comment 1 ' );

				expect( comment2.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment2.data ).toBe( ' Comment 2 ' );

				expect( comment3.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment3.data ).toBe( ' Comment 3 ' );

				expect( comment4.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment4.data ).toBe( ' Comment 4 ' );

				expect( text.nodeType ).toBe( Node.TEXT_NODE );
				expect( text.data ).toBe( 'Paragraph' );

				expect( div.nodeType ).toBe( Node.ELEMENT_NODE );
				expect( div.outerHTML ).toBe( '<div>' +
						'<!-- Comment 1 -->' +
						'<p>' +
							'<!-- Comment 2 -->' +
							'Paragraph' +
							'<!-- Comment 3 -->' +
						'</p>' +
						'<!-- Comment 4 -->' +
					'</div>'
				);

				expect( paragraph.nodeType ).toBe( Node.ELEMENT_NODE );
				expect( paragraph.outerHTML ).toBe( '<p>' +
						'<!-- Comment 2 -->' +
						'Paragraph' +
						'<!-- Comment 3 -->' +
					'</p>'
				);
			} );

			it( 'should insert leading comment nodes from HTML string into <body> collection', () => {
				const bodyDocumentFragment = dataProcessor._toDom(
					'<!-- Comment 1 -->' +
					'<!-- Comment 2 -->' +
					'<h2>Heading</h2>' +
					'<p>Paragraph</p>' +
					'<!-- Comment 3 -->' +
					'<!-- Comment 4 -->'
				);

				const [
					comment1,
					comment2,
					heading,
					paragraph,
					comment3,
					comment4
				] = bodyDocumentFragment.childNodes;

				expect( bodyDocumentFragment.childNodes.length ).toBe( 6 );

				expect( comment1.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment1.data ).toBe( ' Comment 1 ' );

				expect( comment2.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment2.data ).toBe( ' Comment 2 ' );

				expect( comment3.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment3.data ).toBe( ' Comment 3 ' );

				expect( comment4.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment4.data ).toBe( ' Comment 4 ' );

				expect( heading.nodeType ).toBe( Node.ELEMENT_NODE );
				expect( heading.outerHTML ).toBe( '<h2>Heading</h2>' );

				expect( paragraph.nodeType ).toBe( Node.ELEMENT_NODE );
				expect( paragraph.outerHTML ).toBe( '<p>Paragraph</p>' );
			} );

			it( 'should insert leading script nodes from HTML string into <body> collection', () => {
				const bodyDocumentFragment = dataProcessor._toDom(
					'<!-- Comment 1 -->' +
					'<!-- Comment 2 -->' +
					'<h2>Heading</h2>' +
					'<p>Paragraph</p>' +
					'<!-- Comment 3 -->' +
					'<!-- Comment 4 -->'
				);

				const [
					comment1,
					comment2,
					heading,
					paragraph,
					comment3,
					comment4
				] = bodyDocumentFragment.childNodes;

				expect( bodyDocumentFragment.childNodes.length ).toBe( 6 );

				expect( comment1.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment1.data ).toBe( ' Comment 1 ' );

				expect( comment2.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment2.data ).toBe( ' Comment 2 ' );

				expect( comment3.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment3.data ).toBe( ' Comment 3 ' );

				expect( comment4.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment4.data ).toBe( ' Comment 4 ' );

				expect( heading.nodeType ).toBe( Node.ELEMENT_NODE );
				expect( heading.outerHTML ).toBe( '<h2>Heading</h2>' );

				expect( paragraph.nodeType ).toBe( Node.ELEMENT_NODE );
				expect( paragraph.outerHTML ).toBe( '<p>Paragraph</p>' );
			} );

			it( 'should preserve leading non-layout elements', () => {
				const bodyDocumentFragment = dataProcessor._toDom(
					'<!-- Comment 1 -->' +
					'<style>#foo { color: red }</style>' +
					'<script>bar</script>' +
					'<p>' +
						'<!-- Comment 2 -->' +
						'Paragraph' +
					'</p>'
				);

				expect( bodyDocumentFragment.childNodes.length ).toBe( 4 );

				const [
					comment1,
					style,
					script,
					paragraph
				] = bodyDocumentFragment.childNodes;

				expect( comment1.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment1.data ).toBe( ' Comment 1 ' );

				expect( style.nodeType ).toBe( Node.ELEMENT_NODE );
				expect( style.outerHTML ).toBe( '<style>#foo { color: red }</style>' );

				expect( script.nodeType ).toBe( Node.ELEMENT_NODE );
				expect( script.outerHTML ).toBe( '<script>bar</script>' );

				expect( paragraph.nodeType ).toBe( Node.ELEMENT_NODE );
				expect( paragraph.outerHTML ).toBe( '<p><!-- Comment 2 -->Paragraph</p>' );
			} );
		} );

		describe( 'full HTML document', () => {
			it( 'should ignore leading non-layout elements if <html> tag is provided', () => {
				const bodyDocumentFragment = dataProcessor._toDom(
					'<html>' +
						'<!-- Comment 1 -->' +
						'<style>#foo { color: red }</style>' +
						'<script>bar</script>' +
						'<p>' +
							'<!-- Comment 2 -->' +
							'Paragraph' +
						'</p>' +
					'</html>'
				);

				expect( bodyDocumentFragment.childNodes.length ).toBe( 1 );

				const [ paragraph ] = bodyDocumentFragment.childNodes;
				const [ comment2, text ] = paragraph.childNodes;

				expect( comment2.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment2.data ).toBe( ' Comment 2 ' );

				expect( text.nodeType ).toBe( Node.TEXT_NODE );
				expect( text.data ).toBe( 'Paragraph' );
			} );

			it( 'should ignore leading non-layout elements if <body> tag is provided', () => {
				const bodyDocumentFragment = dataProcessor._toDom(
					'<!-- Comment 1 -->' +
					'<style>#foo { color: red }</style>' +
					'<script>bar</script>' +
					'<body>' +
						'<p>' +
							'<!-- Comment 2 -->' +
							'Paragraph' +
						'</p>' +
					'</body>'
				);

				expect( bodyDocumentFragment.childNodes.length ).toBe( 1 );

				const [ paragraph ] = bodyDocumentFragment.childNodes;
				const [ comment2, text ] = paragraph.childNodes;

				expect( comment2.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment2.data ).toBe( ' Comment 2 ' );

				expect( text.nodeType ).toBe( Node.TEXT_NODE );
				expect( text.data ).toBe( 'Paragraph' );
			} );

			it( 'should ignore leading non-layout elements if <meta> tag is provided', () => {
				const bodyDocumentFragment = dataProcessor._toDom(
					'<meta>' +
					'<!-- Comment 1 -->' +
					'<style>#foo { color: red }</style>' +
					'<script>bar</script>' +
					'<p>' +
						'<!-- Comment 2 -->' +
						'Paragraph' +
					'</p>'
				);

				expect( bodyDocumentFragment.childNodes.length ).toBe( 1 );

				const [ paragraph ] = bodyDocumentFragment.childNodes;
				const [ comment2, text ] = paragraph.childNodes;

				expect( comment2.nodeType ).toBe( Node.COMMENT_NODE );
				expect( comment2.data ).toBe( ' Comment 2 ' );

				expect( text.nodeType ).toBe( Node.TEXT_NODE );
				expect( text.data ).toBe( 'Paragraph' );
			} );
		} );
	} );

	describe( 'toData()', () => {
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
				'<html>' +
					'<head></head>' +
					'<body>' +
						'<!-- Comment 1 -->' +
						'<p>' +
							'foo' +
							'<!-- Comment 2 -->' +
							'bar' +
						'</p>' +
						'<!-- Comment 3 -->' +
					'</body>' +
				'</html>'
			);

			expect( _stringifyView( fragment ) ).toBe( '<p>foobar</p>' );
		} );

		it( 'should preserve comments when `false`', () => {
			dataProcessor.skipComments = false;

			const fragment = dataProcessor.toView(
				'<html>' +
					'<head></head>' +
					'<body>' +
						'<!-- Comment 1 -->' +
						'<p>' +
							'foo' +
							'<!-- Comment 2 -->' +
							'bar' +
						'</p>' +
						'<!-- Comment 3 -->' +
					'</body>' +
				'</html>'
			);

			expect( _stringifyView( fragment ) ).toBe( '<$comment></$comment><p>foo<$comment></$comment>bar</p><$comment></$comment>' );
		} );
	} );
} );
