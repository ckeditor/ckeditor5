/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { getOverlayMountRoot } from '../../src/dom/getoverlaymountroot.js';
import { createSyntheticShadowRoot, reportRootNode } from '../_utils/syntheticshadowroot.js';

describe( 'getOverlayMountRoot()', () => {
	let host;

	beforeEach( () => {
		host = document.createElement( 'div' );
		document.body.appendChild( host );
	} );

	afterEach( () => {
		host.remove();
	} );

	describe( 'light DOM', () => {
		it( 'returns document.body for a connected element', () => {
			const anchor = document.createElement( 'span' );

			host.appendChild( anchor );

			expect( getOverlayMountRoot( anchor ) ).toBe( document.body );
		} );

		it( 'returns document.body for document.body itself', () => {
			expect( getOverlayMountRoot( document.body ) ).toBe( document.body );
		} );

		it( 'returns the body of the node\'s own document for an element inside an iframe', () => {
			const iframe = document.createElement( 'iframe' );

			host.appendChild( iframe );

			const iframeDocument = iframe.contentDocument;
			const anchor = iframeDocument.createElement( 'span' );

			iframeDocument.body.appendChild( anchor );

			expect( getOverlayMountRoot( anchor ) ).toBe( iframeDocument.body );
			expect( getOverlayMountRoot( anchor ) ).not.toBe( document.body );
		} );

		it( 'returns null for a detached element', () => {
			const anchor = document.createElement( 'span' );

			expect( getOverlayMountRoot( anchor ) ).toBe( null );
		} );

		it( 'returns null for an element inside a detached subtree', () => {
			const detachedParent = document.createElement( 'div' );
			const anchor = document.createElement( 'span' );

			detachedParent.appendChild( anchor );

			expect( getOverlayMountRoot( anchor ) ).toBe( null );
		} );
	} );

	for ( const mode of [ 'open', 'closed' ] ) {
		describe( `${ mode } shadow root`, () => {
			it( 'returns the shadow root for an element inside it', () => {
				const root = host.attachShadow( { mode } );
				const anchor = document.createElement( 'span' );

				root.appendChild( anchor );

				expect( getOverlayMountRoot( anchor ) ).toBe( root );
			} );

			it( 'returns the innermost shadow root for an element inside nested shadow roots', () => {
				const outerRoot = host.attachShadow( { mode } );
				const innerHost = document.createElement( 'div' );
				const anchor = document.createElement( 'span' );

				outerRoot.appendChild( innerHost );

				const innerRoot = innerHost.attachShadow( { mode } );

				innerRoot.appendChild( anchor );

				expect( getOverlayMountRoot( anchor ) ).toBe( innerRoot );
			} );

			it( 'returns the shadow root itself when it is the anchor node', () => {
				const host = document.createElement( 'div' );

				document.body.appendChild( host );

				const root = host.attachShadow( { mode } );

				expect( getOverlayMountRoot( root ) ).toBe( root );

				host.remove();
			} );

			it( 'returns null for an element inside the shadow root of a detached host', () => {
				const detachedHost = document.createElement( 'div' );
				const root = detachedHost.attachShadow( { mode } );
				const anchor = document.createElement( 'span' );

				root.appendChild( anchor );

				expect( getOverlayMountRoot( anchor ) ).toBe( null );
			} );
		} );
	}
} );

describe( 'getOverlayMountRoot() in a synthetic shadow root', () => {
	let host, anchor;

	beforeEach( () => {
		host = document.createElement( 'div' );
		anchor = document.createElement( 'span' );

		host.appendChild( anchor );
		document.body.appendChild( host );
	} );

	afterEach( () => {
		host.remove();
	} );

	it( 'returns document.body instead of the root, which cannot be mounted into', () => {
		reportRootNode( anchor, createSyntheticShadowRoot( host ) );

		expect( getOverlayMountRoot( anchor ) ).toBe( document.body );
	} );

	it( 'still returns a real shadow root while the polyfill has replaced the global', () => {
		const realHost = document.createElement( 'div' );
		const realRoot = realHost.attachShadow( { mode: 'closed' } );
		const realAnchor = document.createElement( 'span' );

		realRoot.appendChild( realAnchor );
		host.appendChild( realHost );

		createSyntheticShadowRoot( document.createElement( 'div' ) );

		expect( getOverlayMountRoot( realAnchor ) ).toBe( realRoot );
	} );
} );
