/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { isShadowRoot, isNativeShadowRoot } from '../../src/dom/isshadowroot.js';
import { createSyntheticShadowRoot } from '../_utils/syntheticshadowroot.js';

describe( 'isShadowRoot()', () => {
	let host;

	beforeEach( () => {
		host = document.createElement( 'div' );
		document.body.appendChild( host );
	} );

	afterEach( () => {
		host.remove();
	} );

	it( 'returns true for an open shadow root', () => {
		const root = host.attachShadow( { mode: 'open' } );

		expect( isShadowRoot( root ) ).toBe( true );
	} );

	it( 'returns true for a closed shadow root', () => {
		const root = host.attachShadow( { mode: 'closed' } );

		expect( isShadowRoot( root ) ).toBe( true );
	} );

	it( 'returns false for a document', () => {
		expect( isShadowRoot( document ) ).toBe( false );
	} );

	it( 'returns false for an element', () => {
		expect( isShadowRoot( host ) ).toBe( false );
	} );

	it( 'returns false for a text node', () => {
		expect( isShadowRoot( document.createTextNode( 'foo' ) ) ).toBe( false );
	} );

	it( 'returns false for a document fragment', () => {
		expect( isShadowRoot( document.createDocumentFragment() ) ).toBe( false );
	} );

	it( 'returns false for null and undefined', () => {
		expect( isShadowRoot( null ) ).toBe( false );
		expect( isShadowRoot( undefined ) ).toBe( false );
	} );

	it( 'returns false for a plain object', () => {
		expect( isShadowRoot( {} ) ).toBe( false );
	} );

	// An `<a>` element exposes a truthy `host` property (the URL host), so a naive truthy-`host` check
	// would give a false positive here.
	it( 'returns false for an anchor element (which has a truthy `host` property)', () => {
		const anchor = document.createElement( 'a' );

		anchor.href = 'https://example.com:8080/path';

		expect( anchor.host ).toBeTruthy();
		expect( isShadowRoot( anchor ) ).toBe( false );
	} );

	// The check must resolve `ShadowRoot` through the object's own `defaultView` so it stays correct for
	// shadow roots created in another realm (e.g. an iframe), where a plain `instanceof ShadowRoot`
	// against the top-level constructor would be `false`.
	it( 'returns true for a shadow root created in another realm (iframe)', () => {
		const iframe = document.createElement( 'iframe' );

		document.body.appendChild( iframe );

		const iframeDocument = iframe.contentDocument;
		const iframeHost = iframeDocument.createElement( 'div' );

		iframeDocument.body.appendChild( iframeHost );

		const iframeRoot = iframeHost.attachShadow( { mode: 'open' } );

		expect( iframeRoot instanceof ShadowRoot ).toBe( false );
		expect( isShadowRoot( iframeRoot ) ).toBe( true );

		iframe.remove();
	} );

	// A document with no browsing context (here, `createHTMLDocument()`) has a `null` `defaultView`, so
	// the check falls back to the current realm's `ShadowRoot`, which created it.
	it( 'returns true for a shadow root in a document with no browsing context', () => {
		const detachedDocument = document.implementation.createHTMLDocument( 'test' );
		const detachedHost = detachedDocument.createElement( 'div' );

		detachedDocument.body.appendChild( detachedHost );

		const detachedRoot = detachedHost.attachShadow( { mode: 'open' } );

		expect( detachedDocument.defaultView ).toBe( null );
		expect( isShadowRoot( detachedRoot ) ).toBe( true );
	} );
} );

describe( 'isNativeShadowRoot()', () => {
	let host;

	beforeEach( () => {
		host = document.createElement( 'div' );
		document.body.appendChild( host );
	} );

	afterEach( () => {
		host.remove();
	} );

	it( 'returns true for an open shadow root', () => {
		expect( isNativeShadowRoot( host.attachShadow( { mode: 'open' } ) ) ).toBe( true );
	} );

	it( 'returns true for a closed shadow root', () => {
		expect( isNativeShadowRoot( host.attachShadow( { mode: 'closed' } ) ) ).toBe( true );
	} );

	it( 'returns false for a synthetic shadow root, which isShadowRoot() accepts', () => {
		const syntheticRoot = createSyntheticShadowRoot( host );

		expect( isShadowRoot( syntheticRoot ) ).toBe( true );
		expect( isNativeShadowRoot( syntheticRoot ) ).toBe( false );
	} );

	it( 'still returns true for a real shadow root while the polyfill has replaced the global', () => {
		const realRoot = host.attachShadow( { mode: 'closed' } );

		createSyntheticShadowRoot( document.createElement( 'div' ) );

		expect( isNativeShadowRoot( realRoot ) ).toBe( true );
	} );

	it( 'returns false for a document, an element and a document fragment', () => {
		expect( isNativeShadowRoot( document ) ).toBe( false );
		expect( isNativeShadowRoot( host ) ).toBe( false );
		expect( isNativeShadowRoot( document.createDocumentFragment() ) ).toBe( false );
	} );

	it( 'returns false for null and undefined', () => {
		expect( isNativeShadowRoot( null ) ).toBe( false );
		expect( isNativeShadowRoot( undefined ) ).toBe( false );
	} );
} );
