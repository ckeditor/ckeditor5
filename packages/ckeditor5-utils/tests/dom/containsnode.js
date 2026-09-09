/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, afterEach } from 'vitest';
import { containsNode } from '../../src/dom/containsnode.js';

describe( 'containsNode()', () => {
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

	it( 'should return true when node is the container itself', () => {
		const element = attach( document.createElement( 'div' ) );

		expect( containsNode( element, element ) ).toBe( true );
	} );

	it( 'should return false when node is null', () => {
		const element = attach( document.createElement( 'div' ) );

		expect( containsNode( element, null ) ).toBe( false );
	} );

	it( 'should behave like Node#contains() for a plain light DOM ancestor/descendant pair', () => {
		const parent = attach( document.createElement( 'div' ) );
		const child = document.createElement( 'span' );

		parent.appendChild( child );

		expect( containsNode( parent, child ) ).toBe( true );
		expect( parent.contains( child ) ).toBe( true );
	} );

	it( 'should return false for two unrelated light DOM elements', () => {
		const elementA = attach( document.createElement( 'div' ) );
		const elementB = attach( document.createElement( 'div' ) );

		expect( containsNode( elementA, elementB ) ).toBe( false );
	} );

	it( 'should return true for document as the container of any attached element, unlike a plain ancestor walk over parentElement', () => {
		const element = attach( document.createElement( 'div' ) );

		expect( containsNode( document, element ) ).toBe( true );
	} );

	it( 'should return true when the container is document and the node lives inside an open shadow root', () => {
		const host = attach( document.createElement( 'div' ) );
		const shadowRoot = host.attachShadow( { mode: 'open' } );
		const element = document.createElement( 'div' );

		shadowRoot.appendChild( element );

		expect( document.contains( element ) ).toBe( false ); // The problem this function solves.
		expect( containsNode( document, element ) ).toBe( true );
	} );

	it( 'should return true when the container is document and the node lives inside a closed shadow root', () => {
		const host = attach( document.createElement( 'div' ) );
		const shadowRoot = host.attachShadow( { mode: 'closed' } );
		const element = document.createElement( 'div' );

		shadowRoot.appendChild( element );

		expect( containsNode( document, element ) ).toBe( true );
	} );

	it( 'should return true when the container is document and the node lives several shadow roots deep', () => {
		const outerHost = attach( document.createElement( 'div' ) );
		const outerRoot = outerHost.attachShadow( { mode: 'open' } );

		const innerHost = document.createElement( 'div' );
		outerRoot.appendChild( innerHost );
		const innerRoot = innerHost.attachShadow( { mode: 'closed' } );

		const element = document.createElement( 'div' );
		innerRoot.appendChild( element );

		expect( containsNode( document, element ) ).toBe( true );
	} );

	it( 'should return true when the container is a light DOM ancestor of the shadow host, not document itself', () => {
		const wrapper = attach( document.createElement( 'div' ) );
		const host = document.createElement( 'div' );

		wrapper.appendChild( host );

		const shadowRoot = host.attachShadow( { mode: 'open' } );
		const element = document.createElement( 'div' );

		shadowRoot.appendChild( element );

		expect( containsNode( wrapper, element ) ).toBe( true );
	} );

	it( 'should return true when the container is the shadow root itself and node is inside it', () => {
		const host = attach( document.createElement( 'div' ) );
		const shadowRoot = host.attachShadow( { mode: 'open' } );
		const element = document.createElement( 'div' );

		shadowRoot.appendChild( element );

		expect( containsNode( shadowRoot, element ) ).toBe( true );
	} );

	it( 'should return false when the container is a shadow root and node is outside it (a light DOM sibling of the host)', () => {
		const host = attach( document.createElement( 'div' ) );
		const shadowRoot = host.attachShadow( { mode: 'open' } );
		const sibling = attach( document.createElement( 'div' ) );

		expect( containsNode( shadowRoot, sibling ) ).toBe( false );
	} );

	it( 'should return false when node lives in a shadow root unrelated to the container', () => {
		const hostA = attach( document.createElement( 'div' ) );
		const rootA = hostA.attachShadow( { mode: 'open' } );

		const hostB = attach( document.createElement( 'div' ) );
		hostB.attachShadow( { mode: 'open' } );

		const element = document.createElement( 'div' );
		rootA.appendChild( element );

		expect( containsNode( hostB, element ) ).toBe( false );
	} );

	it( 'should return false for a node fully detached from the document, even against document as the container', () => {
		const detachedParent = document.createElement( 'div' );
		const detachedChild = document.createElement( 'div' );

		detachedParent.appendChild( detachedChild );

		expect( containsNode( document, detachedChild ) ).toBe( false );
	} );
} );
