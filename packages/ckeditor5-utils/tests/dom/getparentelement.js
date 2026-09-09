/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { getParentElement } from '../../src/dom/getparentelement.js';

describe( 'getParentElement()', () => {
	let host;

	beforeEach( () => {
		host = document.createElement( 'div' );
		document.body.appendChild( host );
	} );

	afterEach( () => {
		host.remove();
	} );

	describe( 'light DOM', () => {
		it( 'returns the parent element', () => {
			const child = document.createElement( 'span' );

			host.appendChild( child );

			expect( getParentElement( child ) ).toBe( host );
		} );

		it( 'returns null when the node has no parent element', () => {
			const orphan = document.createElement( 'span' );

			expect( getParentElement( orphan ) ).toBe( null );
		} );

		it( 'returns null for the documentElement (its parent is the document)', () => {
			expect( getParentElement( document.documentElement ) ).toBe( null );
		} );
	} );

	for ( const mode of [ 'open', 'closed' ] ) {
		describe( `${ mode } shadow root`, () => {
			it( 'returns the host for a node whose parent is the shadow root', () => {
				const root = host.attachShadow( { mode } );
				const inner = document.createElement( 'span' );

				root.appendChild( inner );

				expect( getParentElement( inner ) ).toBe( host );
			} );

			it( 'returns the parent element for a node deeper inside the shadow root', () => {
				const root = host.attachShadow( { mode } );
				const wrapper = document.createElement( 'div' );
				const inner = document.createElement( 'span' );

				wrapper.appendChild( inner );
				root.appendChild( wrapper );

				expect( getParentElement( inner ) ).toBe( wrapper );
			} );
		} );
	}
} );
