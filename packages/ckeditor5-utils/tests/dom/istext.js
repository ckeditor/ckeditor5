/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect } from 'vitest';
import { isText } from '../../src/dom/istext.js';

describe( 'isText()', () => {
	it( 'detects native DOM Text', () => {
		expect( isText( new Text( 'foo' ) ) ).toBe( true );

		expect( isText( 'foo' ) ).toBe( false );
		expect( isText( {} ) ).toBe( false );
		expect( isText( null ) ).toBe( false );
		expect( isText( undefined ) ).toBe( false );
		expect( isText( new Date() ) ).toBe( false );
		expect( isText( 42 ) ).toBe( false );
		expect( isText( document.createElement( 'div' ) ) ).toBe( false );
		expect( isText( document.createDocumentFragment() ) ).toBe( false );
		expect( isText( document.createComment( 'a' ) ) ).toBe( false );
	} );

	it( 'works for texts in an iframe', () => {
		return new Promise( ( resolve, reject ) => {
			const iframe = document.createElement( 'iframe' );

			iframe.addEventListener( 'load', () => {
				try {
					const iframeDocument = iframe.contentWindow.document;

					const textNode = iframeDocument.createTextNode( 'foo' );

					expect( isText( textNode ) ).toBe( true );

					iframe.remove();
					resolve();
				} catch ( error ) {
					reject( error );
				}
			} );

			document.body.appendChild( iframe );
		} );
	} );
} );
