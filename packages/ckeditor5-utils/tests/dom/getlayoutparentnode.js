/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { getLayoutParentNode } from '../../src/dom/getlayoutparentnode.js';

describe( 'getLayoutParentNode()', () => {
	let host;

	beforeEach( () => {
		host = document.createElement( 'div' );
		document.body.appendChild( host );
	} );

	afterEach( () => {
		host.remove();
	} );

	describe( 'light DOM', () => {
		it( 'returns the parent node', () => {
			const child = document.createElement( 'span' );

			host.appendChild( child );

			expect( getLayoutParentNode( child ) ).toBe( host );
		} );

		it( 'returns the document for the documentElement', () => {
			expect( getLayoutParentNode( document.documentElement ) ).toBe( document );
		} );

		it( 'returns null when the node has no parent', () => {
			expect( getLayoutParentNode( document.createElement( 'span' ) ) ).toBe( null );
		} );
	} );

	for ( const mode of [ 'open', 'closed' ] ) {
		describe( `${ mode } shadow root`, () => {
			it( 'steps onto the shadow root, so a walk can see the boundary', () => {
				const root = host.attachShadow( { mode } );
				const inner = document.createElement( 'span' );

				root.appendChild( inner );

				expect( getLayoutParentNode( inner ) ).toBe( root );
			} );

			it( 'steps from the shadow root to its host', () => {
				const root = host.attachShadow( { mode } );

				expect( getLayoutParentNode( root ) ).toBe( host );
			} );
		} );
	}

	describe( 'slotted content', () => {
		it( 'returns the slot an element is assigned to instead of its node-tree parent', () => {
			const root = host.attachShadow( { mode: 'open' } );
			const slot = document.createElement( 'slot' );
			const slotted = document.createElement( 'span' );

			root.appendChild( slot );
			host.appendChild( slotted );

			expect( getLayoutParentNode( slotted ) ).toBe( slot );
		} );

		it( 'falls back to the node tree when the slot is in a closed root, which does not expose it', () => {
			const root = host.attachShadow( { mode: 'closed' } );
			const slot = document.createElement( 'slot' );
			const slotted = document.createElement( 'span' );

			root.appendChild( slot );
			host.appendChild( slotted );

			expect( getLayoutParentNode( slotted ) ).toBe( host );
		} );
	} );

	describe( 'walking outwards', () => {
		it( 'reaches the document from inside a shadow tree the node is slotted into', () => {
			const root = host.attachShadow( { mode: 'open' } );
			const frame = document.createElement( 'div' );
			const slot = document.createElement( 'slot' );
			const slotted = document.createElement( 'span' );

			frame.appendChild( slot );
			root.appendChild( frame );
			host.appendChild( slotted );

			const walked = [];

			for ( let node = slotted; node; node = getLayoutParentNode( node ) ) {
				walked.push( node );
			}

			// The detour through the shadow tree happens before the host, which the node-tree walk would
			// have gone to directly.
			expect( walked ).toEqual( [ slotted, slot, frame, root, host, document.body, document.documentElement, document ] );
		} );
	} );
} );
