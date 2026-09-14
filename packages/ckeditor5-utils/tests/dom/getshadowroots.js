/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, afterEach } from 'vitest';
import { getShadowRoots } from '../../src/dom/getshadowroots.js';

describe( 'getShadowRoots()', () => {
	const attachedElements = [];

	afterEach( () => {
		for ( const element of attachedElements ) {
			element.remove();
		}

		attachedElements.length = 0;
	} );

	function attach( element ) {
		document.body.appendChild( element );
		attachedElements.push( element );

		return element;
	}

	it( 'should return an empty array for a node in the light DOM', () => {
		const element = attach( document.createElement( 'div' ) );

		expect( getShadowRoots( element ) ).toEqual( [] );
	} );

	it( 'should return an empty array for a detached node with no shadow root ancestor', () => {
		const element = document.createElement( 'div' );

		expect( getShadowRoots( element ) ).toEqual( [] );
	} );

	it( 'should return the shadow root of a node living directly inside an open shadow root', () => {
		const host = attach( document.createElement( 'div' ) );
		const shadowRoot = host.attachShadow( { mode: 'open' } );
		const element = document.createElement( 'div' );

		shadowRoot.appendChild( element );

		expect( getShadowRoots( element ) ).toEqual( [ shadowRoot ] );
	} );

	it( 'should return the shadow root of a node living directly inside a closed shadow root', () => {
		const host = attach( document.createElement( 'div' ) );
		const shadowRoot = host.attachShadow( { mode: 'closed' } );
		const element = document.createElement( 'div' );

		shadowRoot.appendChild( element );

		expect( getShadowRoots( element ) ).toEqual( [ shadowRoot ] );
	} );

	it( 'should return every shadow root, innermost first, for a node nested through several of them', () => {
		const outerHost = attach( document.createElement( 'div' ) );
		const outerRoot = outerHost.attachShadow( { mode: 'open' } );

		const innerHost = document.createElement( 'div' );
		outerRoot.appendChild( innerHost );
		const innerRoot = innerHost.attachShadow( { mode: 'closed' } );

		const element = document.createElement( 'div' );
		innerRoot.appendChild( element );

		expect( getShadowRoots( element ) ).toEqual( [ innerRoot, outerRoot ] );
	} );

	it( 'should find the hosting shadow root even if its host is not attached to the document', () => {
		const host = document.createElement( 'div' );
		const shadowRoot = host.attachShadow( { mode: 'open' } );
		const element = document.createElement( 'div' );

		shadowRoot.appendChild( element );

		expect( getShadowRoots( element ) ).toEqual( [ shadowRoot ] );
	} );

	it( 'should not include a shadow root the node is not actually inside (a sibling subtree)', () => {
		const hostA = attach( document.createElement( 'div' ) );
		const rootA = hostA.attachShadow( { mode: 'open' } );

		const hostB = attach( document.createElement( 'div' ) );
		hostB.attachShadow( { mode: 'open' } );

		const element = document.createElement( 'div' );
		rootA.appendChild( element );

		expect( getShadowRoots( element ) ).toEqual( [ rootA ] );
	} );

	describe( 'slotted content', () => {
		it( 'should include the root holding the slot a node renders in', () => {
			const host = attach( document.createElement( 'div' ) );
			const root = host.attachShadow( { mode: 'open' } );
			const element = document.createElement( 'div' );

			root.appendChild( document.createElement( 'slot' ) );
			host.appendChild( element );

			expect( getShadowRoots( element ) ).toEqual( [ root ] );
		} );

		it( 'should include that root when a plain element sits between the slot and the inner host', () => {
			const outerHost = attach( document.createElement( 'div' ) );
			const outerRoot = outerHost.attachShadow( { mode: 'open' } );

			outerRoot.appendChild( document.createElement( 'slot' ) );

			// The wrapper is what the slot assigns, so `assignedSlot` is null on the inner host below it.
			// A walk that hops straight from a host to its own root skips the outer root entirely.
			const wrapper = document.createElement( 'div' );
			const innerHost = document.createElement( 'div' );
			const innerRoot = innerHost.attachShadow( { mode: 'open' } );
			const element = document.createElement( 'div' );

			innerRoot.appendChild( element );
			wrapper.appendChild( innerHost );
			outerHost.appendChild( wrapper );

			expect( innerHost.assignedSlot ).toBe( null );
			expect( getShadowRoots( element ) ).toEqual( [ innerRoot, outerRoot ] );
		} );

		it( 'should include every root a node renders in through nested slots', () => {
			const outerHost = attach( document.createElement( 'div' ) );
			const outerRoot = outerHost.attachShadow( { mode: 'open' } );

			outerRoot.appendChild( document.createElement( 'slot' ) );

			const middleHost = document.createElement( 'div' );
			const middleRoot = middleHost.attachShadow( { mode: 'open' } );

			middleRoot.appendChild( document.createElement( 'slot' ) );
			outerHost.appendChild( middleHost );

			const innerHost = document.createElement( 'div' );
			const innerRoot = innerHost.attachShadow( { mode: 'open' } );
			const element = document.createElement( 'div' );

			innerRoot.appendChild( element );
			middleHost.appendChild( innerHost );

			expect( getShadowRoots( element ) ).toEqual( [ innerRoot, middleRoot, outerRoot ] );
		} );

		it( 'should not include the root holding the slot when that root is closed', () => {
			const host = attach( document.createElement( 'div' ) );
			const root = host.attachShadow( { mode: 'closed' } );
			const element = document.createElement( 'div' );

			root.appendChild( document.createElement( 'slot' ) );
			host.appendChild( element );

			expect( getShadowRoots( element ) ).toEqual( [] );
		} );
	} );
} );
