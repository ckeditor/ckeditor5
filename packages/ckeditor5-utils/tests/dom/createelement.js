/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import createElement from '../../src/dom/createelement';

describe( 'createElement', () => {
	it( 'should create element', () => {
		const p = createElement( document, 'p' );

		expect( p.tagName.toLowerCase() ).to.equal( 'p' );
		expect( p.childNodes.length ).to.equal( 0 );
	} );

	it( 'should create element with attribute', () => {
		const p = createElement( document, 'p', { class: 'foo' } );

		expect( p.tagName.toLowerCase() ).to.equal( 'p' );
		expect( p.childNodes.length ).to.equal( 0 );
		expect( p.getAttribute( 'class' ) ).to.equal( 'foo' );
	} );

	it( 'should create element with child text node', () => {
		const p = createElement( document, 'p', null, 'foo' );

		expect( p.tagName.toLowerCase() ).to.equal( 'p' );
		expect( p.childNodes.length ).to.equal( 1 );
		expect( p.childNodes[ 0 ].data ).to.equal( 'foo' );
	} );

	it( 'should create ', () => {
		const p = createElement( document, 'p', null, [ 'foo', createElement( document, 'img' ) ] );

		expect( p.tagName.toLowerCase() ).to.equal( 'p' );
		expect( p.childNodes.length ).to.equal( 2 );
		expect( p.childNodes[ 0 ].data ).to.equal( 'foo' );
		expect( p.childNodes[ 1 ].tagName.toLowerCase() ).to.equal( 'img' );
	} );
} );
