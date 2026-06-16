/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';

import { createElement } from '../../src/dom/createelement.js';

describe( 'createElement', () => {
	it( 'should create element', () => {
		const p = createElement( document, 'p' );

		expect( p.tagName.toLowerCase() ).toBe( 'p' );
		expect( p.childNodes.length ).toBe( 0 );
	} );

	it( 'should create element with attribute', () => {
		const p = createElement( document, 'p', { class: 'foo' } );

		expect( p.tagName.toLowerCase() ).toBe( 'p' );
		expect( p.childNodes.length ).toBe( 0 );
		expect( p.getAttribute( 'class' ) ).toBe( 'foo' );
	} );

	it( 'should create element with namespace', () => {
		const namespace = 'http://www.w3.org/2000/svg';
		const svg = createElement( document, 'svg', { xmlns: namespace } );

		expect( svg.tagName.toLowerCase() ).toBe( 'svg' );
		expect( svg.getAttribute( 'xmlns' ) ).toBe( namespace );
		expect( svg.createSVGRect ).toBeTypeOf( 'function' );
	} );

	it( 'should create element with child text node', () => {
		const p = createElement( document, 'p', null, 'foo' );

		expect( p.tagName.toLowerCase() ).toBe( 'p' );
		expect( p.childNodes.length ).toBe( 1 );
		expect( p.childNodes[ 0 ].data ).toBe( 'foo' );
	} );

	it( 'should create ', () => {
		const p = createElement( document, 'p', null, [ 'foo', createElement( document, 'img' ) ] );

		expect( p.tagName.toLowerCase() ).toBe( 'p' );
		expect( p.childNodes.length ).toBe( 2 );
		expect( p.childNodes[ 0 ].data ).toBe( 'foo' );
		expect( p.childNodes[ 1 ].tagName.toLowerCase() ).toBe( 'img' );
	} );

	const validTestCases = [
		'foo-bar-baz',
		'Custom-Element'
		// Uncomment last valid test case when every major browser (Chrome, Firefox, Safari) will support creating elements with this value.
		// Currently, only Chrome supports it since v143.
		// See details:
		// [x] Chrome: bugs.chromium.org/p/chromium/issues/detail?id=1334640
		// [ ] Firefox: bugzilla.mozilla.org/show_bug.cgi?id=1773312
		// [ ] Safari: bugs.webkit.org/show_bug.cgi?id=241419
		// '🙂'
	];

	for ( const name of validTestCases ) {
		it( `should create element for name: '${ name }'`, () => {
			expect( createElement( document, name ) ).toBeInstanceOf( HTMLElement );
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
			expect( () => createElement( document, name ) ).toThrow();
		} );
	}
} );
