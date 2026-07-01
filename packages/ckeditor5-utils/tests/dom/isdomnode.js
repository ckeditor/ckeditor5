/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { isNode } from '../../src/dom/isnode.js';

describe( 'isNode()', () => {
	it( 'detects native DOM nodes', () => {
		expect( isNode( document ) ).toBe( true );
		expect( isNode( document.createElement( 'div' ) ) ).toBe( true );
		expect( isNode( document.createTextNode( 'Foo' ) ) ).toBe( true );

		expect( isNode( {} ) ).toBe( false );
		expect( isNode( null ) ).toBe( false );
		expect( isNode( undefined ) ).toBe( false );
		expect( isNode( new Date() ) ).toBe( false );
		expect( isNode( 42 ) ).toBe( false );
		expect( isNode( window ) ).toBe( false );
	} );

	it( 'works for nodes in an iframe', () => {
		return new Promise( ( resolve, reject ) => {
			const iframe = document.createElement( 'iframe' );

			iframe.addEventListener( 'load', () => {
				try {
					const iframeDocument = iframe.contentWindow.document;

					expect( isNode( iframeDocument ) ).toBe( true );
					expect( isNode( iframeDocument.createElement( 'div' ) ) ).toBe( true );
					expect( isNode( iframeDocument.createTextNode( 'Foo' ) ) ).toBe( true );

					expect( isNode( iframe.contentWindow ) ).toBe( false );

					iframe.remove();
					resolve();
				} catch ( error ) {
					iframe.remove();
					reject( error );
				}
			} );

			document.body.appendChild( iframe );
		} );
	} );
} );
