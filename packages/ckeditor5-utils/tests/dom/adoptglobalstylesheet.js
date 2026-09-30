/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { adoptGlobalStyleSheet } from '../../src/dom/adoptglobalstylesheet.js';

describe( 'adoptGlobalStyleSheet()', () => {
	let iframe, doc;

	// A fresh document per test, so adopting into it does not leak between tests (the module remembers what it
	// already adopted, and the main document lives for the whole run).
	beforeEach( () => {
		iframe = document.createElement( 'iframe' );
		document.body.appendChild( iframe );
		doc = iframe.contentDocument;
	} );

	afterEach( () => {
		iframe.remove();
	} );

	it( 'should adopt the stylesheet into the document', () => {
		adoptGlobalStyleSheet( doc, '.foo { overflow: hidden }' );

		expect( doc.adoptedStyleSheets.length ).toBe( 1 );
		expect( doc.adoptedStyleSheets[ 0 ].cssRules[ 0 ].cssText ).toContain( 'overflow: hidden' );
	} );

	it( 'should apply the rules to the document it was adopted into', () => {
		const element = doc.createElement( 'div' );

		element.className = 'foo';
		doc.body.appendChild( element );

		expect( doc.defaultView.getComputedStyle( element ).overflow ).toBe( 'visible' );

		adoptGlobalStyleSheet( doc, '.foo { overflow: hidden }' );

		expect( doc.defaultView.getComputedStyle( element ).overflow ).toBe( 'hidden' );
	} );

	it( 'should adopt the same stylesheet only once', () => {
		adoptGlobalStyleSheet( doc, '.foo { overflow: hidden }' );
		adoptGlobalStyleSheet( doc, '.foo { overflow: hidden }' );

		expect( doc.adoptedStyleSheets.length ).toBe( 1 );
	} );

	it( 'should adopt different stylesheets separately', () => {
		adoptGlobalStyleSheet( doc, '.foo { overflow: hidden }' );
		adoptGlobalStyleSheet( doc, '.bar { overflow: hidden }' );

		expect( doc.adoptedStyleSheets.length ).toBe( 2 );
	} );

	it( 'should keep the stylesheets already adopted into the document', () => {
		const existing = new doc.defaultView.CSSStyleSheet();

		existing.replaceSync( '.existing { overflow: hidden }' );
		doc.adoptedStyleSheets = [ existing ];

		adoptGlobalStyleSheet( doc, '.foo { overflow: hidden }' );

		expect( doc.adoptedStyleSheets.length ).toBe( 2 );
		expect( doc.adoptedStyleSheets[ 0 ] ).toBe( existing );
	} );

	it( 'should track documents separately', () => {
		const otherIframe = document.createElement( 'iframe' );

		document.body.appendChild( otherIframe );

		adoptGlobalStyleSheet( doc, '.foo { overflow: hidden }' );
		adoptGlobalStyleSheet( otherIframe.contentDocument, '.foo { overflow: hidden }' );

		expect( doc.adoptedStyleSheets.length ).toBe( 1 );
		expect( otherIframe.contentDocument.adoptedStyleSheets.length ).toBe( 1 );

		otherIframe.remove();
	} );
} );
