/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, afterEach } from 'vitest';
import { getParentNode } from '../../src/dom/getparentnode.js';

describe( 'getParentNode()', () => {
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

	it( 'should return the parent element of a regular, light DOM node', () => {
		const parent = attach( document.createElement( 'div' ) );
		const child = document.createElement( 'span' );

		parent.appendChild( child );

		expect( getParentNode( child ) ).toBe( parent );
	} );

	it( 'should return null for a node with no parent', () => {
		const detached = document.createElement( 'div' );

		expect( getParentNode( detached ) ).toBe( null );
	} );

	it( 'should return the owner document for <html>, unlike Node#parentElement', () => {
		expect( getParentNode( document.documentElement ) ).toBe( document );
		expect( document.documentElement.parentElement ).toBe( null );
	} );

	it( 'should return the host of an open shadow root', () => {
		const host = attach( document.createElement( 'div' ) );
		const shadowRoot = host.attachShadow( { mode: 'open' } );

		expect( getParentNode( shadowRoot ) ).toBe( host );
	} );

	it( 'should return the host of a closed shadow root', () => {
		const host = attach( document.createElement( 'div' ) );
		const shadowRoot = host.attachShadow( { mode: 'closed' } );

		expect( getParentNode( shadowRoot ) ).toBe( host );
	} );

	it( 'should return the shadow root (not the host) for a direct child of a shadow root', () => {
		const host = attach( document.createElement( 'div' ) );
		const shadowRoot = host.attachShadow( { mode: 'open' } );
		const child = document.createElement( 'div' );

		shadowRoot.appendChild( child );

		// One step at a time: the shadow root first, then (on a second call) its host.
		expect( getParentNode( child ) ).toBe( shadowRoot );
		expect( getParentNode( getParentNode( child ) ) ).toBe( host );
	} );

	it( 'should work for a shadow root whose host is not attached to the document', () => {
		const host = document.createElement( 'div' );
		const shadowRoot = host.attachShadow( { mode: 'open' } );

		expect( getParentNode( shadowRoot ) ).toBe( host );
	} );
} );
