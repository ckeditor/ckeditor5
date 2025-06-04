/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import HtmlDataProcessor from '../../src/dataprocessor/htmldataprocessor.js';
import BasicHtmlWriter from '../../src/dataprocessor/basichtmlwriter.js';
import DomConverter from '../../src/view/domconverter.js';
import xssTemplates from '../../tests/dataprocessor/_utils/xsstemplates.js';
import ViewDocumentFragment from '../../src/view/documentfragment.js';
import { stringify, parse } from '../../src/dev-utils/view.js';
import { StylesProcessor } from '../../src/view/stylesmap.js';
import ViewDocument from '../../src/view/document.js';

describe( 'HtmlDataProcessor', () => {
	let dataProcessor, viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		dataProcessor = new HtmlDataProcessor( viewDocument );
	} );

	describe( 'constructor', () => {
		it( 'should set public properties', () => {
			expect( dataProcessor ).to.have.property( 'domParser' );
			expect( dataProcessor ).to.have.property( 'domConverter' );
			expect( dataProcessor ).to.have.property( 'htmlWriter' );
			expect( dataProcessor ).to.have.property( 'skipComments' );

			expect( dataProcessor.domParser ).to.be.an.instanceOf( DOMParser );
			expect( dataProcessor.domConverter ).to.be.an.instanceOf( DomConverter );
			expect( dataProcessor.htmlWriter ).to.be.an.instanceOf( BasicHtmlWriter );
			expect( dataProcessor.skipComments ).to.be.true;
		} );
	} );

	describe( 'toView()', () => {
		it( 'should return empty DocumentFragment when empty string is passed', () => {
			const fragment = dataProcessor.toView( '' );
			expect( fragment ).to.be.an.instanceOf( ViewDocumentFragment );
			expect( fragment.childCount ).to.equal( 0 );
		} );

		it( 'should convert HTML to DocumentFragment with single text node', () => {
			const fragment = dataProcessor.toView( 'foo bar' );

			expect( stringify( fragment ) ).to.equal( 'foo bar' );
		} );

		it( 'should convert HTML to DocumentFragment with multiple child nodes', () => {
			const fragment = dataProcessor.toView( '<p>foo</p><p>bar</p>' );

			expect( stringify( fragment ) ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		it( 'should return only elements inside body tag', () => {
			const fragment = dataProcessor.toView( '<html><head></head><body><p>foo</p></body></html>' );

			expect( stringify( fragment ) ).to.equal( '<p>foo</p>' );
		} );

		it( 'should not add any additional nodes', () => {
			const fragment = dataProcessor.toView( 'foo <b>bar</b> text' );

			expect( stringify( fragment ) ).to.equal( 'foo <b>bar</b> text' );
		} );

		// Test against XSS attacks.
		for ( const name in xssTemplates ) {
			const input = xssTemplates[ name ].replace( /%xss%/g, 'testXss()' );

			it( 'should prevent XSS attacks: ' + name, done => {
				window.testXss = sinon.spy();
				dataProcessor.toView( input );

				setTimeout( () => {
					sinon.assert.notCalled( window.testXss );
					done();
				}, 10 );
			} );
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

				expect( stringify( fragment ) ).to.equal(
					'<span>This is the<span>\u00a0</span></span>' +
					'<a href="url">third developer preview</a>' +
					'<span><span>\u00a0</span>of<span>\u00a0</span></span>' +
					'<strong>CKEditor\u00a05</strong>' +
					'<span>.</span>'
				);

				// Just to be sure... stringify() uses conversion and the browser extensively,
				// so it's not entirely safe.
				expect( fragment.getChild( 0 ).getChild( 1 ).getChild( 0 ).data ).to.equal( '\u00a0' );
				expect( fragment.getChild( 2 ).getChild( 0 ).getChild( 0 ).data ).to.equal( '\u00a0' );
				expect( fragment.getChild( 2 ).getChild( 2 ).getChild( 0 ).data ).to.equal( '\u00a0' );
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

				expect( bodyDocumentFragment.childNodes.length ).to.equal( 1 );
				expect( div.childNodes.length ).to.equal( 3 );
				expect( paragraph.childNodes.length ).to.equal( 3 );

				expect( comment1.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment1.data ).to.equal( ' Comment 1 ' );

				expect( comment2.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment2.data ).to.equal( ' Comment 2 ' );

				expect( comment3.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment3.data ).to.equal( ' Comment 3 ' );

				expect( comment4.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment4.data ).to.equal( ' Comment 4 ' );

				expect( text.nodeType ).to.equal( Node.TEXT_NODE );
				expect( text.data ).to.equal( 'Paragraph' );

				expect( div.nodeType ).to.equal( Node.ELEMENT_NODE );
				expect( div.outerHTML ).to.equal(
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

				expect( paragraph.nodeType ).to.equal( Node.ELEMENT_NODE );
				expect( paragraph.outerHTML ).to.equal(
					'<p>' +
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

				expect( bodyDocumentFragment.childNodes.length ).to.equal( 6 );

				expect( comment1.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment1.data ).to.equal( ' Comment 1 ' );

				expect( comment2.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment2.data ).to.equal( ' Comment 2 ' );

				expect( comment3.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment3.data ).to.equal( ' Comment 3 ' );

				expect( comment4.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment4.data ).to.equal( ' Comment 4 ' );

				expect( heading.nodeType ).to.equal( Node.ELEMENT_NODE );
				expect( heading.outerHTML ).to.equal( '<h2>Heading</h2>' );

				expect( paragraph.nodeType ).to.equal( Node.ELEMENT_NODE );
				expect( paragraph.outerHTML ).to.equal( '<p>Paragraph</p>' );
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

				expect( bodyDocumentFragment.childNodes.length ).to.equal( 6 );

				expect( comment1.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment1.data ).to.equal( ' Comment 1 ' );

				expect( comment2.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment2.data ).to.equal( ' Comment 2 ' );

				expect( comment3.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment3.data ).to.equal( ' Comment 3 ' );

				expect( comment4.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment4.data ).to.equal( ' Comment 4 ' );

				expect( heading.nodeType ).to.equal( Node.ELEMENT_NODE );
				expect( heading.outerHTML ).to.equal( '<h2>Heading</h2>' );

				expect( paragraph.nodeType ).to.equal( Node.ELEMENT_NODE );
				expect( paragraph.outerHTML ).to.equal( '<p>Paragraph</p>' );
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

				expect( bodyDocumentFragment.childNodes.length ).to.equal( 4 );

				const [
					comment1,
					style,
					script,
					paragraph
				] = bodyDocumentFragment.childNodes;

				expect( comment1.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment1.data ).to.equal( ' Comment 1 ' );

				expect( style.nodeType ).to.equal( Node.ELEMENT_NODE );
				expect( style.outerHTML ).to.equal( '<style>#foo { color: red }</style>' );

				expect( script.nodeType ).to.equal( Node.ELEMENT_NODE );
				expect( script.outerHTML ).to.equal( '<script>bar</script>' );

				expect( paragraph.nodeType ).to.equal( Node.ELEMENT_NODE );
				expect( paragraph.outerHTML ).to.equal( '<p><!-- Comment 2 -->Paragraph</p>' );
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

				expect( bodyDocumentFragment.childNodes.length ).to.equal( 1 );

				const [ paragraph ] = bodyDocumentFragment.childNodes;
				const [ comment2, text ] = paragraph.childNodes;

				expect( comment2.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment2.data ).to.equal( ' Comment 2 ' );

				expect( text.nodeType ).to.equal( Node.TEXT_NODE );
				expect( text.data ).to.equal( 'Paragraph' );
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

				expect( bodyDocumentFragment.childNodes.length ).to.equal( 1 );

				const [ paragraph ] = bodyDocumentFragment.childNodes;
				const [ comment2, text ] = paragraph.childNodes;

				expect( comment2.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment2.data ).to.equal( ' Comment 2 ' );

				expect( text.nodeType ).to.equal( Node.TEXT_NODE );
				expect( text.data ).to.equal( 'Paragraph' );
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

				expect( bodyDocumentFragment.childNodes.length ).to.equal( 1 );

				const [ paragraph ] = bodyDocumentFragment.childNodes;
				const [ comment2, text ] = paragraph.childNodes;

				expect( comment2.nodeType ).to.equal( Node.COMMENT_NODE );
				expect( comment2.data ).to.equal( ' Comment 2 ' );

				expect( text.nodeType ).to.equal( Node.TEXT_NODE );
				expect( text.data ).to.equal( 'Paragraph' );
			} );
		} );
	} );

	describe( 'toData()', () => {
		it( 'should return empty string when empty DocumentFragment is passed', () => {
			const fragment = new ViewDocumentFragment( viewDocument );

			expect( dataProcessor.toData( fragment ) ).to.equal( '' );
		} );

		it( 'should return text if document fragment with single text node is passed', () => {
			const fragment = new ViewDocumentFragment( viewDocument );
			fragment._appendChild( parse( 'foo bar' ) );

			expect( dataProcessor.toData( fragment ) ).to.equal( 'foo bar' );
		} );

		it( 'should convert HTML to DocumentFragment with multiple child nodes', () => {
			const fragment = parse( '<p>foo</p><p>bar</p>' );

			expect( dataProcessor.toData( fragment ) ).to.equal( '<p>foo</p><p>bar</p>' );
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

			expect( stringify( fragment ) ).to.equal( '<p>foo</p><div class="raw"></div><p>bar</p>' );
			expect( fragment.getChild( 1 ).getCustomProperty( '$rawContent' ) ).to.equal( '<!-- 123 --> abc <!-- 456 -->' );
		} );
	} );

	describe( 'useFillerType()', () => {
		it( 'should turn on and off using marked block fillers', () => {
			const fragment = parse( '<container:p></container:p>' );

			expect( dataProcessor.toData( fragment ) ).to.equal( '<p>&nbsp;</p>' );

			dataProcessor.useFillerType( 'marked' );

			expect( dataProcessor.toData( fragment ) ).to.equal( '<p><span data-cke-filler="true">&nbsp;</span></p>' );

			dataProcessor.useFillerType( 'default' );

			expect( dataProcessor.toData( fragment ) ).to.equal( '<p>&nbsp;</p>' );
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

			expect( stringify( fragment ) ).to.equal( '<p>foobar</p>' );
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

			expect( stringify( fragment ) ).to.equal( '<$comment></$comment><p>foo<$comment></$comment>bar</p><$comment></$comment>' );
		} );
	} );
} );
