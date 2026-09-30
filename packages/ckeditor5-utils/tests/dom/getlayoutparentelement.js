/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { getLayoutParentElement } from '../../src/dom/getlayoutparentelement.js';

describe( 'getLayoutParentElement()', () => {
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

			expect( getLayoutParentElement( child ) ).toBe( host );
		} );

		it( 'returns null when the node has no parent element', () => {
			expect( getLayoutParentElement( document.createElement( 'span' ) ) ).toBe( null );
		} );
	} );

	for ( const mode of [ 'open', 'closed' ] ) {
		describe( `${ mode } shadow root`, () => {
			it( 'returns the host for a node whose parent is the shadow root', () => {
				const root = host.attachShadow( { mode } );
				const inner = document.createElement( 'span' );

				root.appendChild( inner );

				expect( getLayoutParentElement( inner ) ).toBe( host );
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

			expect( getLayoutParentElement( slotted ) ).toBe( slot );
		} );

		it( 'returns the slot a text node is assigned to', () => {
			const root = host.attachShadow( { mode: 'open' } );
			const slot = document.createElement( 'slot' );
			const slotted = document.createTextNode( 'foo' );

			root.appendChild( slot );
			host.appendChild( slotted );

			expect( getLayoutParentElement( slotted ) ).toBe( slot );
		} );

		it( 'returns the outer slot for a slot assigned to another slot', () => {
			const outerRoot = host.attachShadow( { mode: 'open' } );
			const outerSlot = document.createElement( 'slot' );

			outerRoot.appendChild( outerSlot );

			const middle = document.createElement( 'div' );
			const middleRoot = middle.attachShadow( { mode: 'open' } );
			const innerSlot = document.createElement( 'slot' );

			middleRoot.appendChild( innerSlot );
			host.appendChild( middle );

			expect( getLayoutParentElement( innerSlot ) ).toBe( middle );
			expect( getLayoutParentElement( middle ) ).toBe( outerSlot );
		} );

		it( 'falls back to the node tree when the slot is in a closed root, which does not expose it', () => {
			const root = host.attachShadow( { mode: 'closed' } );
			const slot = document.createElement( 'slot' );
			const slotted = document.createElement( 'span' );

			root.appendChild( slot );
			host.appendChild( slotted );

			expect( slotted.assignedSlot ).toBe( null );
			expect( getLayoutParentElement( slotted ) ).toBe( host );
		} );

		it( 'returns the node-tree parent for an element the slot did not assign', () => {
			const root = host.attachShadow( { mode: 'open' } );
			const slot = document.createElement( 'slot' );
			const wrapper = document.createElement( 'div' );
			const inner = document.createElement( 'span' );

			slot.name = 'somewhere-else';
			root.appendChild( slot );
			wrapper.appendChild( inner );
			host.appendChild( wrapper );

			expect( getLayoutParentElement( inner ) ).toBe( wrapper );
		} );
	} );
} );
