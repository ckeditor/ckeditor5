/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals setTimeout, window */

import HtmlDataProcessor from '../../src/dataprocessor/htmldataprocessor';
import xssTemplates from '../../tests/dataprocessor/_utils/xsstemplates';
import ViewDocumentFragment from '../../src/view/documentfragment';
import { stringify, parse } from '../../src/dev-utils/view';
import { StylesProcessor } from '../../src/view/stylesmap';
import ViewDocument from '../../src/view/document';

describe( 'HtmlDataProcessor', () => {
	let stylesProcessor, dataProcessor, viewDocument;

	beforeEach( () => {
		stylesProcessor = new StylesProcessor();
		viewDocument = new ViewDocument( stylesProcessor );
		dataProcessor = new HtmlDataProcessor( viewDocument );
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
} );
