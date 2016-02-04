/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import HtmlDataProcessor from '/ckeditor5/core/dataprocessor/htmldataprocessor.js';

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

		it( 'should parse element attributes', () => {
			const fragment = dataProcessor.toDom( '<p class="paragraph" data-id="12"></p>' );
			expect( fragment.childNodes.length ).to.equal( 1 );
			const childNode = fragment.childNodes[ 0 ];

			expect( childNode.attributes.length ).to.equal( 2 );
			expect( childNode.getAttribute( 'class' ) ).to.equal( 'paragraph' );
			expect( childNode.getAttribute( 'data-id' ) ).to.equal( '12' );
		} );
	} );

	describe( 'toData', () => {
		it( 'should return empty string when empty DocumentFragment is passed' , () => {
			const data = dataProcessor.toData( document.createDocumentFragment() );
			expect( data ).to.equal( '' );
		} );

		it( 'should create text from single text node', () => {
			const text = 'foo bar';
			const fragment = document.createDocumentFragment();
			const textNode = document.createTextNode( text );
			fragment.appendChild( textNode );

			const data = dataProcessor.toData( fragment );
			expect( data ).to.equal( text );
		} );

		it( 'should return correct HTML from fragment with paragraph', () => {
			const fragment = document.createDocumentFragment();
			const paragraph = document.createElement( 'p' );
			paragraph.textContent = 'foo bar';
			fragment.appendChild( paragraph );

			const data = dataProcessor.toData( fragment );
			expect( data ).to.equal( '<p>foo bar</p>' );
		} );

		it( 'should return correct HTML from fragment with multiple child nodes', () => {
			const fragment = document.createDocumentFragment();
			const text = document.createTextNode( 'foo bar' );
			const paragraph = document.createElement( 'p' );
			const div = document.createElement( 'div' );

			paragraph.textContent = 'foo';
			div.textContent = 'bar';

			fragment.appendChild( text );
			fragment.appendChild( paragraph );
			fragment.appendChild( div );

			const data = dataProcessor.toData( fragment );

			expect( data ).to.equal( 'foo bar<p>foo</p><div>bar</div>' );
		} );

		it( 'should return HTML with attributes', () => {
			const fragment = document.createDocumentFragment();
			const paragraph = document.createElement( 'p' );
			paragraph.setAttribute( 'class', 'paragraph' );
			paragraph.setAttribute( 'data-id', '12' );
			fragment.appendChild( paragraph );

			const data = dataProcessor.toData( fragment );

			expect( data ).to.equal( '<p class="paragraph" data-id="12"></p>' );
		} );
	} );
} );
