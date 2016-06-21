/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: browser-only */

'use strict';

import HtmlDataProcessor from '/ckeditor5/engine/dataprocessor/htmldataprocessor.js';
import xssTemplates from '/tests/engine/dataprocessor/_utils/xsstemplates.js';

describe( 'HtmlDataProcessor', () => {
	const dataProcessor = new HtmlDataProcessor();

	describe( 'toDom', () => {
		it( 'should return empty DocumentFragment when empty string is passed', () => {
			const fragment = dataProcessor.toDom( '' );
			expect( fragment ).to.be.an.instanceOf( DocumentFragment );
			expect( fragment.childNodes.length ).to.equal( 0 );
		} );

		it( 'should convert HTML to DocumentFragment with single text node', () => {
			const fragment = dataProcessor.toDom( 'foo bar' );
			expect( fragment.childNodes.length ).to.equal( 1 );
			expect( fragment.childNodes[ 0 ].nodeType ).to.equal( Node.TEXT_NODE );
			expect( fragment.childNodes[ 0 ].textContent ).to.equal( 'foo bar' );
		} );

		it( 'should convert HTML to DocumentFragment with multiple child nodes', () => {
			const fragment = dataProcessor.toDom( '<p>foo</p><p>bar</p>' );
			expect( fragment.childNodes.length ).to.equal( 2 );
			expect( fragment.childNodes[ 0 ].nodeType ).to.equal( Node.ELEMENT_NODE );
			expect( fragment.childNodes[ 0 ].textContent ).to.equal( 'foo' );
			expect( fragment.childNodes[ 1 ].nodeType ).to.equal( Node.ELEMENT_NODE );
			expect( fragment.childNodes[ 1 ].textContent ).to.equal( 'bar' );
		} );

		it( 'should return only elements inside body tag', () => {
			const fragment = dataProcessor.toDom( '<html><head></head><body><p>foo</p></body></html>' );
			expect( fragment.childNodes.length ).to.equal( 1 );
			expect( fragment.childNodes[ 0 ].textContent ).to.equal( 'foo' );
			expect( fragment.childNodes[ 0 ].tagName.toLowerCase() ).to.equal( 'p' );
		} );

		it( 'should not add any additional nodes', () => {
			const fragment = dataProcessor.toDom( 'foo <b>bar</b> text' );
			expect( fragment.childNodes.length ).to.equal( 3 );
			expect( fragment.childNodes[ 0 ].nodeType ).to.equal( Node.TEXT_NODE );
			expect( fragment.childNodes[ 0 ].textContent ).to.equal( 'foo ' );
			expect( fragment.childNodes[ 1 ].nodeType ).to.equal( Node.ELEMENT_NODE );
			expect( fragment.childNodes[ 1 ].innerHTML ).to.equal( 'bar' );
			expect( fragment.childNodes[ 2 ].nodeType ).to.equal( Node.TEXT_NODE );
			expect( fragment.childNodes[ 2 ].textContent ).to.equal( ' text' );
		} );

		// Test against XSS attacks.
		for ( let name in xssTemplates ) {
			const input = xssTemplates[ name ].replace( /%xss%/g, 'testXss()' );

			it( 'should prevent XSS attacks: ' + name, ( done ) => {
				window.testXss = sinon.spy();
				dataProcessor.toDom( input );

				setTimeout( () => {
					sinon.assert.notCalled( window.testXss );
					done();
				}, 10 );
			} );
		}
	} );

	describe( 'toData', () => {
		it( 'should use HtmlWriter', () => {
			const spy = sinon.spy( dataProcessor._htmlWriter, 'getHtml' );

			const fragment = document.createDocumentFragment();
			const paragraph = document.createElement( 'p' );
			fragment.appendChild( paragraph );
			dataProcessor.toData( fragment );

			spy.restore();
			sinon.assert.calledWithExactly( spy, fragment );
		} );
	} );
} );
