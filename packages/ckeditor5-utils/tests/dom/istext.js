/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, Text */

import { describe, it, expect } from 'vitest';
import isText from '../../src/dom/istext.ts';

describe( 'isText()', () => {
	it( 'detects native DOM Text', () => {
		expect( isText( new Text( 'foo' ) ) ).to.be.true;

		expect( isText( 'foo' ) ).to.be.false;
		expect( isText( {} ) ).to.be.false;
		expect( isText( null ) ).to.be.false;
		expect( isText( undefined ) ).to.be.false;
		expect( isText( new Date() ) ).to.be.false;
		expect( isText( 42 ) ).to.be.false;
		expect( isText( document.createElement( 'div' ) ) ).to.be.false;
		expect( isText( document.createDocumentFragment() ) ).to.be.false;
		expect( isText( document.createComment( 'a' ) ) ).to.be.false;
	} );

	it( 'works for texts in an iframe', () => new Promise( done => {
		const iframe = document.createElement( 'iframe' );

		iframe.addEventListener( 'load', () => {
			const iframeDocument = iframe.contentWindow.document;

			const textNode = iframeDocument.createTextNode( 'foo' );

			expect( isText( textNode ) ).to.equal( true );

			iframe.remove();
			done();
		} );

		document.body.appendChild( iframe );
	} ) );
} );
