/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// The theme declares its custom properties on `:root, :host`, so one stylesheet resolves them whether the
// editor UI lives in the light DOM (`:root`) or inside a shadow root (`:host`, as `:root` matches nothing
// there). These tests assert that contract against the real theme stylesheets, which the test runner loads
// into the document for every test in this package.
//
// `--ck-border-radius` stands in for the whole theme: it is declared once, at the root scope, in
// `theme/globals/_rounded.css`.
const TOKEN = '--ck-border-radius';
const THEME_VALUE = '2px';

describe( 'theme tokens in a shadow root', () => {
	let host, disabledStyleSheets;

	beforeEach( () => {
		host = document.createElement( 'div' );
		document.body.appendChild( host );

		disabledStyleSheets = [];
	} );

	afterEach( () => {
		host.remove();
		document.documentElement.style.removeProperty( TOKEN );

		for ( const styleSheet of disabledStyleSheets ) {
			styleSheet.disabled = false;
		}
	} );

	describe( 'resolution', () => {
		it( 'should resolve in the light DOM', () => {
			expect( readToken( appendProbe( document.body ) ) ).toBe( THEME_VALUE );
		} );

		for ( const [ mode, article ] of [ [ 'open', 'an' ], [ 'closed', 'a' ] ] ) {
			it( `should resolve inside ${ article } ${ mode } shadow root, with no light-DOM copy of the stylesheet`, () => {
				const shadowRoot = host.attachShadow( { mode } );

				mirrorStyleSheetsInto( shadowRoot );
				disableDocumentStyleSheets();

				// Guards the assertion below: with the document-level copies disabled, nothing is left to
				// inherit the token into the shadow tree, so it can only come from the adopted sheet.
				expect( readToken( appendProbe( document.body ) ) ).toBe( '' );

				expect( readToken( appendProbe( shadowRoot ) ) ).toBe( THEME_VALUE );
			} );
		}
	} );

	describe( 'integrator overrides', () => {
		it( 'should be overridable on the shadow host', () => {
			const shadowRoot = host.attachShadow( { mode: 'open' } );

			mirrorStyleSheetsInto( shadowRoot );

			const probe = appendProbe( shadowRoot );

			// A light-DOM rule matching the host comes from the outer tree, and for normal declarations the
			// outer tree wins over the inner tree – so this is the override path that works in shadow mode.
			host.style.setProperty( TOKEN, '9px' );

			expect( readToken( probe ) ).toBe( '9px' );
		} );

		it( 'should not be overridable on the document root, unlike in the light DOM', () => {
			const shadowRoot = host.attachShadow( { mode: 'open' } );

			mirrorStyleSheetsInto( shadowRoot );

			const shadowProbe = appendProbe( shadowRoot );
			const lightProbe = appendProbe( document.body );

			document.documentElement.style.setProperty( TOKEN, '9px' );

			// A known limitation of anchoring tokens on `:host`: it declares the token on the host element,
			// and a declaration that matches an element beats a value inherited into it. An integrator
			// overriding on `:root` therefore has to target the host element (or the shadow tree) instead.
			expect( readToken( shadowProbe ) ).toBe( THEME_VALUE );
			expect( readToken( lightProbe ) ).toBe( '9px' );
		} );
	} );

	function appendProbe( parent ) {
		const probe = document.createElement( 'div' );

		parent.appendChild( probe );

		return probe;
	}

	function readToken( element ) {
		return window.getComputedStyle( element ).getPropertyValue( TOKEN ).trim();
	}

	// Adopts the document's stylesheets into the given root, the way an integrator has to make the editor
	// stylesheet available inside the shadow root the editor lives in.
	function mirrorStyleSheetsInto( shadowRoot ) {
		const adopted = [];

		for ( const styleSheet of Array.from( document.styleSheets ) ) {
			try {
				const cssText = Array.from( styleSheet.cssRules ).map( rule => rule.cssText ).join( '\n' );
				const adoptedStyleSheet = new CSSStyleSheet();

				adoptedStyleSheet.replaceSync( cssText );
				adopted.push( adoptedStyleSheet );
			} catch {
				// A sheet whose rules cannot be read, or one `replaceSync()` rejects – it carries no theme
				// tokens, so skipping it does not affect what is asserted here.
				continue;
			}
		}

		shadowRoot.adoptedStyleSheets = adopted;
	}

	// Disables the document-level stylesheets, so the light DOM stops being a source of the theme tokens.
	function disableDocumentStyleSheets() {
		for ( const styleSheet of Array.from( document.styleSheets ) ) {
			styleSheet.disabled = true;
			disabledStyleSheets.push( styleSheet );
		}
	}
} );
