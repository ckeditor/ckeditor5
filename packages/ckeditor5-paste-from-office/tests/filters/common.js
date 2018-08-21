/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, CSSStyleSheet */

import DocumentFragment from '@ckeditor/ckeditor5-engine/src/view/documentfragment';

import { extractBody, bodyToView, extractStyles, stylesToStylesheet } from '../../src/filters/common';

describe( 'Filters – common', () => {
	describe( 'extractBody', () => {
		it( 'correctly extracts body tag contents from the given string', () => {
			const html = '<html><head></head><body><p>FooBar</p></body></html>';
			const result = extractBody( { html } );

			expect( result.body ).to.equal( '<p>FooBar</p>' );
		} );

		it( 'returns null if body tag present but empty', () => {
			const html = '<html><head></head><body></body></html>';
			const result = extractBody( { html } );

			expect( result.body ).to.null;
		} );

		it( 'returns null if no body tag present', () => {
			const html = '<html><head></head></html>';
			const result = extractBody( { html } );

			expect( result.body ).to.null;
		} );
	} );

	describe( 'bodyToView', () => {
		it( 'transforms body string to DocumentFragment instance', () => {
			const body = '<p>FooBar</p>';
			const result = bodyToView( { body } );

			expect( result.view ).to.instanceof( DocumentFragment );
			expect( result.view.childCount ).to.equal( 1 );
		} );

		it( 'does nothing when body string not present', () => {
			const result = bodyToView( {} );

			expect( result.view ).to.null;
		} );
	} );

	describe( 'extractStyles', () => {
		it( 'correctly extracts style tag contents from the given string', () => {
			const html = '<html><head><style>p { color: red; }</style></head><body></body></html>';
			const result = extractStyles( { html } );

			expect( result.styles ).to.equal( 'p { color: red; }' );
		} );

		it( 'correctly extracts contents from many style tags in a the given string', () => {
			const html = '<html><head>' +
				'<style>p { color: red; }</style><meta tag="12345">' +
				'<style>h1 { font-size: 10px; }</style></head><body><p>FooBar</p>' +
				'<style>.cls1 { width: 10em; }</style></body></html>';

			const result = extractStyles( { html } );

			expect( result.styles ).to.equal( 'p { color: red; }h1 { font-size: 10px; }.cls1 { width: 10em; }' );
		} );

		it( 'returns null if style tag present but empty', () => {
			const html = '<html><head><style></style></head><body></body></html>';
			const result = extractStyles( { html } );

			expect( result.styles ).to.null;
		} );

		it( 'returns null if no style tag present', () => {
			const html = '<html><head></head><body></body></html>';
			const result = extractStyles( { html } );

			expect( result.styles ).to.null;
		} );
	} );

	describe( 'stylesToStylesheet', () => {
		let spy = null;

		const shadowDomSupported = document.head && document.head.attachShadow;
		const styles = 'p { color: red; } h1 { font-size: 20px; }';

		afterEach( () => {
			if ( shadowDomSupported ) {
				// Restore native `attachSahdow()` function;
				document.head.attachShadow = shadowDomSupported;
			}

			if ( spy ) {
				// Restore spy.
				spy.restore();
				spy = null;
			}
		} );

		( shadowDomSupported ? it : it.skip )( 'parses styles using shadow DOM if available', () => {
			spy = sinon.spy( document, 'createElement' );

			const result = stylesToStylesheet( { styles }, document );

			// We cannot directly spy `attachShadow` as it is called on temporary element, so we check if `div`
			// was created which is a wrapper for shadow DOM. For `iframe` method only `iframe` element is created.
			expect( spy.calledWithExactly( 'div' ) ).to.true;
			expect( spy.neverCalledWith( 'iframe' ) ).to.true;

			expect( result.stylesheet ).to.instanceof( CSSStyleSheet );
			expect( result.stylesheet.cssRules.length ).to.equal( 2 );
			expect( result.stylesheet.cssRules[ 0 ].style.color ).to.equal( 'red' );
			expect( result.stylesheet.cssRules[ 1 ].style[ 'font-size' ] ).to.equal( '20px' );
		} );

		it( 'parses styles using iframe if shadow DOM not supported', () => {
			if ( shadowDomSupported ) {
				// Make native `attachShadow()` function `null` to force styles via iframe parsing.
				document.head.attachShadow = null;
			}

			spy = sinon.spy( document, 'createElement' );

			const result = stylesToStylesheet( { styles }, document );

			// Check if only `iframe` was used.
			expect( spy.calledWithExactly( 'iframe' ) ).to.true;
			expect( spy.neverCalledWith( 'div' ) ).to.true;

			expect( result.stylesheet ).to.instanceof( CSSStyleSheet );
			expect( result.stylesheet.cssRules.length ).to.equal( 2 );
			expect( result.stylesheet.cssRules[ 0 ].style.color ).to.equal( 'red' );
			expect( result.stylesheet.cssRules[ 1 ].style[ 'font-size' ] ).to.equal( '20px' );
		} );

		it( 'does nothing and returns null if styles are empty', () => {
			spy = sinon.spy( document, 'createElement' );

			const styles = '';
			const result = stylesToStylesheet( { styles }, document );

			expect( spy.neverCalledWith( 'iframe' ) ).to.true;
			expect( spy.neverCalledWith( 'div' ) ).to.true;
			expect( result.stylesheet ).to.null;
		} );

		it( 'does nothing and returns null if document not provided', () => {
			spy = sinon.spy( document, 'createElement' );

			const result = stylesToStylesheet( { styles } );

			expect( spy.neverCalledWith( 'iframe' ) ).to.true;
			expect( spy.neverCalledWith( 'div' ) ).to.true;
			expect( result.stylesheet ).to.null;
		} );

		it( 'replaces @list selector so it is parsed correctly', () => {
			const styles = '@list { color: red; } p { color: blue; } @list l11:level1234 { color: green; }';

			const result = stylesToStylesheet( { styles }, document );

			expect( result.stylesheet ).to.instanceof( CSSStyleSheet );
			expect( result.stylesheet.cssRules.length ).to.equal( 3 );
			expect( result.stylesheet.cssRules[ 0 ].selectorText ).to.equal( 'at_list' );
			expect( result.stylesheet.cssRules[ 1 ].selectorText ).to.equal( 'p' );
			expect( result.stylesheet.cssRules[ 2 ].selectorText ).to.equal( 'at_list l11_level1234' );
			expect( result.stylesheet.cssRules[ 0 ].style.color ).to.equal( 'red' );
			expect( result.stylesheet.cssRules[ 1 ].style.color ).to.equal( 'blue' );
			expect( result.stylesheet.cssRules[ 2 ].style.color ).to.equal( 'green' );
		} );
	} );
} );
