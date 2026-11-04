/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, afterEach } from 'vitest';
import { getEventRoots } from '../../src/dom/geteventroots.js';

describe( 'getEventRoots()', () => {
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

	function createIframeDocument() {
		return attach( document.createElement( 'iframe' ) ).contentDocument;
	}

	it( 'should return the global document for a node in the light DOM', () => {
		const element = attach( document.createElement( 'div' ) );

		expect( getEventRoots( element ) ).toEqual( [ document ] );
	} );

	it( 'should return an empty array for a detached node with no shadow root ancestor', () => {
		const element = document.createElement( 'div' );

		expect( getEventRoots( element ) ).toEqual( [] );
	} );

	it( 'should return the shadow root followed by the document for a node inside a connected shadow root', () => {
		const host = attach( document.createElement( 'div' ) );
		const shadowRoot = host.attachShadow( { mode: 'open' } );
		const element = document.createElement( 'div' );

		shadowRoot.appendChild( element );

		expect( getEventRoots( element ) ).toEqual( [ shadowRoot, document ] );
	} );

	it( 'should return the closed shadow root followed by the document for a node inside a connected closed shadow root', () => {
		const host = attach( document.createElement( 'div' ) );
		const shadowRoot = host.attachShadow( { mode: 'closed' } );
		const element = document.createElement( 'div' );

		shadowRoot.appendChild( element );

		expect( getEventRoots( element ) ).toEqual( [ shadowRoot, document ] );
	} );

	it( 'should return every shadow root, innermost first, followed by the document for a node in nested shadow roots', () => {
		const outerHost = attach( document.createElement( 'div' ) );
		const outerRoot = outerHost.attachShadow( { mode: 'open' } );

		const innerHost = document.createElement( 'div' );
		outerRoot.appendChild( innerHost );
		const innerRoot = innerHost.attachShadow( { mode: 'closed' } );

		const element = document.createElement( 'div' );
		innerRoot.appendChild( element );

		expect( getEventRoots( element ) ).toEqual( [ innerRoot, outerRoot, document ] );
	} );

	it( 'should return only the shadow root, without a document, for a node inside a detached shadow root', () => {
		const host = document.createElement( 'div' );
		const shadowRoot = host.attachShadow( { mode: 'open' } );
		const element = document.createElement( 'div' );

		shadowRoot.appendChild( element );

		expect( getEventRoots( element ) ).toEqual( [ shadowRoot ] );
	} );

	it( 'should return the shadow root itself followed by the document for a connected shadow root', () => {
		const host = attach( document.createElement( 'div' ) );
		const shadowRoot = host.attachShadow( { mode: 'open' } );

		expect( getEventRoots( shadowRoot ) ).toEqual( [ shadowRoot, document ] );
	} );

	it( 'should return an empty array for `null`', () => {
		expect( getEventRoots( null ) ).toEqual( [] );
	} );

	it( 'should return the document itself for a document', () => {
		expect( getEventRoots( document ) ).toEqual( [ document ] );
	} );

	describe( 'iframe', () => {
		it( 'should return the iframe document, not the global one, for a node in the iframe', () => {
			const iframeDocument = createIframeDocument();
			const element = iframeDocument.createElement( 'div' );

			iframeDocument.body.appendChild( element );

			expect( getEventRoots( element ) ).toEqual( [ iframeDocument ] );
		} );

		it( 'should return the iframe document for a node created by the global document and moved into the iframe', () => {
			const iframeDocument = createIframeDocument();
			const element = document.createElement( 'div' );

			iframeDocument.body.appendChild( element );

			expect( getEventRoots( element ) ).toEqual( [ iframeDocument ] );
		} );

		it( 'should return the shadow root followed by the iframe document for a node in a shadow root inside the iframe', () => {
			const iframeDocument = createIframeDocument();
			const host = iframeDocument.createElement( 'div' );

			iframeDocument.body.appendChild( host );

			const shadowRoot = host.attachShadow( { mode: 'open' } );
			const element = iframeDocument.createElement( 'div' );

			shadowRoot.appendChild( element );

			expect( getEventRoots( element ) ).toEqual( [ shadowRoot, iframeDocument ] );
		} );

		it( 'should return the iframe document itself for the iframe document', () => {
			const iframeDocument = createIframeDocument();

			expect( getEventRoots( iframeDocument ) ).toEqual( [ iframeDocument ] );
		} );
	} );
} );
