/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import BasicHtmlWriter from '../../src/dataprocessor/basichtmlwriter.js';

describe( 'BasicHtmlWriter', () => {
	const basicHtmlWriter = new BasicHtmlWriter();

	it( 'should return empty string when empty DocumentFragment is passed', () => {
		const data = basicHtmlWriter.getHtml( document.createDocumentFragment() );
		expect( data ).to.equal( '' );
	} );

	it( 'should create text from single text node', () => {
		const text = 'foo bar';
		const fragment = document.createDocumentFragment();
		const textNode = document.createTextNode( text );
		fragment.appendChild( textNode );

		const data = basicHtmlWriter.getHtml( fragment );
		expect( data ).to.equal( text );

		// Verify if node was not adopted to main document.
		expect( textNode.ownerDocument ).not.equal( document );
	} );

	it( 'should return correct HTML from fragment with paragraph', () => {
		const fragment = document.createDocumentFragment();
		const paragraph = document.createElement( 'p' );
		paragraph.textContent = 'foo bar';
		fragment.appendChild( paragraph );

		const data = basicHtmlWriter.getHtml( fragment );
		expect( data ).to.equal( '<p>foo bar</p>' );

		// Verify if node was not adopted to main document.
		expect( paragraph.ownerDocument ).not.equal( document );
		expect( paragraph.firstChild.ownerDocument ).not.equal( document );
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

		const data = basicHtmlWriter.getHtml( fragment );

		expect( data ).to.equal( 'foo bar<p>foo</p><div>bar</div>' );

		// Verify if node was not adopted to main document.
		expect( text.ownerDocument ).not.equal( document );
		expect( paragraph.ownerDocument ).not.equal( document );
		expect( paragraph.firstChild.ownerDocument ).not.equal( document );
		expect( div.ownerDocument ).not.equal( document );
		expect( div.firstChild.ownerDocument ).not.equal( document );
	} );
} );
