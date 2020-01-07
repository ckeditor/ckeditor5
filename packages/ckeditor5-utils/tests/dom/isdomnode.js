/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document, window */

import isNode from '../../src/dom/isnode';

describe( 'isNode()', () => {
	it( 'detects native DOM nodes', () => {
		expect( isNode( document ) ).to.be.true;
		expect( isNode( document.createElement( 'div' ) ) ).to.be.true;
		expect( isNode( document.createTextNode( 'Foo' ) ) ).to.be.true;

		expect( isNode( {} ) ).to.be.false;
		expect( isNode( null ) ).to.be.false;
		expect( isNode( undefined ) ).to.be.false;
		expect( isNode( new Date() ) ).to.be.false;
		expect( isNode( 42 ) ).to.be.false;
		expect( isNode( window ) ).to.be.false;
	} );

	it( 'works for nodes in an iframe', done => {
		const iframe = document.createElement( 'iframe' );

		iframe.addEventListener( 'load', () => {
			const iframeDocument = iframe.contentWindow.document;

			expect( isNode( iframeDocument ) ).to.be.true;
			expect( isNode( iframeDocument.createElement( 'div' ) ) ).to.be.true;
			expect( isNode( iframeDocument.createTextNode( 'Foo' ) ) ).to.be.true;

			expect( isNode( iframe.contentWindow ) ).to.be.false;

			iframe.remove();
			done();
		} );

		document.body.appendChild( iframe );
	} );
} );
