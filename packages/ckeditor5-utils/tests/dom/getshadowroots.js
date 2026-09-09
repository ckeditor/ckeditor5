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
} );
