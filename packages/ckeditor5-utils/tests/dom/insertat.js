/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import insertAt from '../../src/dom/insertat';

describe( 'insertAt', () => {
	it( 'should insert at given position', () => {
		const div = document.createElement( 'div' );
		const p0 = document.createElement( 'p' );
		const p1 = document.createElement( 'p' );
		const p2 = document.createElement( 'p' );

		div.appendChild( p0 );
		div.appendChild( p2 );

		insertAt( div, 1, p1 );

		expect( div.childNodes.length ).to.equal( 3 );
		expect( div.childNodes[ 0 ] ).to.equal( p0 );
		expect( div.childNodes[ 1 ] ).to.equal( p1 );
		expect( div.childNodes[ 2 ] ).to.equal( p2 );
	} );

	it( 'should insert at the beginning', () => {
		const div = document.createElement( 'div' );
		const p0 = document.createElement( 'p' );
		const p1 = document.createElement( 'p' );
		const p2 = document.createElement( 'p' );

		div.appendChild( p1 );
		div.appendChild( p2 );

		insertAt( div, 0, p0 );

		expect( div.childNodes.length ).to.equal( 3 );
		expect( div.childNodes[ 0 ] ).to.equal( p0 );
		expect( div.childNodes[ 1 ] ).to.equal( p1 );
		expect( div.childNodes[ 2 ] ).to.equal( p2 );
	} );

	it( 'should insert at the end', () => {
		const div = document.createElement( 'div' );
		const p0 = document.createElement( 'p' );
		const p1 = document.createElement( 'p' );
		const p2 = document.createElement( 'p' );

		div.appendChild( p0 );
		div.appendChild( p1 );

		insertAt( div, 2, p2 );

		expect( div.childNodes.length ).to.equal( 3 );
		expect( div.childNodes[ 0 ] ).to.equal( p0 );
		expect( div.childNodes[ 1 ] ).to.equal( p1 );
		expect( div.childNodes[ 2 ] ).to.equal( p2 );
	} );
} );
