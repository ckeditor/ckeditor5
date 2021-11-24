/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals window, DOMParser */

import XmlDataProcessor from '../../src/dataprocessor/xmldataprocessor';
import BasicHtmlWriter from '../../src/dataprocessor/basichtmlwriter';
import DomConverter from '../../src//view/domconverter';
import xssTemplates from '../../tests/dataprocessor/_utils/xsstemplates';
import ViewDocumentFragment from '../../src/view/documentfragment';
import ViewDocument from '../../src/view/document';
import { stringify, parse } from '../../src/dev-utils/view';
import { StylesProcessor } from '../../src/view/stylesmap';

describe( 'XmlDataProcessor', () => {
	let dataProcessor, viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument( new StylesProcessor() );
		dataProcessor = new XmlDataProcessor( viewDocument );
	} );

	describe( 'constructor', () => {
		it( 'should set public properties', () => {
			expect( dataProcessor ).to.have.property( 'namespaces' );
			expect( dataProcessor ).to.have.property( 'domParser' );
			expect( dataProcessor ).to.have.property( 'domConverter' );
			expect( dataProcessor ).to.have.property( 'htmlWriter' );

			expect( dataProcessor.namespaces ).to.be.an.instanceOf( Array );
			expect( dataProcessor.domParser ).to.be.an.instanceOf( DOMParser );
			expect( dataProcessor.domConverter ).to.be.an.instanceOf( DomConverter );
			expect( dataProcessor.htmlWriter ).to.be.an.instanceOf( BasicHtmlWriter );
		} );
	} );

	describe( 'toView', () => {
		it( 'should return empty DocumentFragment when empty string is passed', () => {
			const fragment = dataProcessor.toView( '' );
			expect( fragment ).to.be.an.instanceOf( ViewDocumentFragment );
			expect( fragment.childCount ).to.equal( 0 );
		} );

		it( 'should convert XML to DocumentFragment with single text node', () => {
			const fragment = dataProcessor.toView( 'foo bar' );

			expect( stringify( fragment ) ).to.equal( 'foo bar' );
		} );

		it( 'should convert HTML to DocumentFragment with multiple child nodes', () => {
			const fragment = dataProcessor.toView( '<p>foo</p><p>bar</p>' );

			expect( stringify( fragment ) ).to.equal( '<p>foo</p><p>bar</p>' );
		} );

		it( 'should not add any additional nodes', () => {
			const fragment = dataProcessor.toView( 'foo <b>bar</b> text' );

			expect( stringify( fragment ) ).to.equal( 'foo <b>bar</b> text' );
		} );

		it( 'should allow to use registered namespaces', () => {
			dataProcessor = new XmlDataProcessor( viewDocument, {
				namespaces: [ 'foo', 'bar' ]
			} );

			const fragment = dataProcessor.toView( '<foo:a><bar:b></bar:b></foo:a><bar:b><foo:a></foo:a></bar:b>' );

			expect( stringify( fragment ) ).to.equal( '<foo:a><bar:b></bar:b></foo:a><bar:b><foo:a></foo:a></bar:b>' );
		} );

		it( 'should throw an error when use not registered namespaces', () => {
			expect( () => {
				dataProcessor.toView( '<foo:a></foo:a>' );
			} ).to.throw( Error, /Parse error/ );
		} );

		it( 'should thrown an error when markup is invalid', () => {
			expect( () => {
				dataProcessor.toView( '<b>missing closing tag' );
			} ).to.throw( Error, /Parse error/ );
		} );

		// Test against XSS attacks.
		for ( const name in xssTemplates ) {
			const input = xssTemplates[ name ].replace( /%xss%/g, 'testXss()' );

			it( 'should prevent XSS attacks: ' + name, done => {
				window.testXss = sinon.spy();
				dataProcessor.toView( input );

				window.setTimeout( () => {
					sinon.assert.notCalled( window.testXss );
					done();
				}, 10 );
			} );
		}
	} );

	describe( 'toData', () => {
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
} );
