/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { createElement } from '../../src/dom/createelement.js';

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

	it( 'should create element with namespace', () => {
		const namespace = 'http://www.w3.org/2000/svg';
		const svg = createElement( document, 'svg', { xmlns: namespace } );

		expect( svg.tagName.toLowerCase() ).to.equal( 'svg' );
		expect( svg.getAttribute( 'xmlns' ) ).to.equal( namespace );
		expect( svg.createSVGRect ).to.be.a( 'function' );
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

	const validTestCases = [
		'foo-bar-baz',
		'Custom-Element'
		// Uncomment below test when every major browser (Chrome, Firefox, Safari) will support creating elements with this value.
		// Details here: https://github.com/whatwg/dom/pull/1079.
		// '🙂'
	];

	for ( const name of validTestCases ) {
		it( `should create element for name: '${ name }'`, () => {
			expect( createElement( document, name ) ).to.be.instanceOf( HTMLElement );
		} );
	}

	const invalidTestCases = [
		'200',
		'<',
		'>',
		'!',
		'"',
		// eslint-disable-next-line @stylistic/quotes
		"'",
		'`',
		200
	];

	for ( const name of invalidTestCases ) {
		it( `should throw an error for name: '${ name }'`, () => {
			expect( () => createElement( document, name ) ).to.throw();
		} );
	}
} );
