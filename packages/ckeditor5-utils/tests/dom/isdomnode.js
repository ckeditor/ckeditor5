/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, window */

import isDomNode from '../../src/dom/isdomnode';

describe( 'isDomNode()', () => {
	it( 'detects native DOM nodes', () => {
		expect( isDomNode( document ) ).to.be.true;
		expect( isDomNode( document.createElement( 'div' ) ) ).to.be.true;
		expect( isDomNode( document.createTextNode( 'Foo' ) ) ).to.be.true;

		expect( isDomNode( {} ) ).to.be.false;
		expect( isDomNode( null ) ).to.be.false;
		expect( isDomNode( undefined ) ).to.be.false;
		expect( isDomNode( new Date() ) ).to.be.false;
		expect( isDomNode( 42 ) ).to.be.false;
		expect( isDomNode( window ) ).to.be.false;
	} );

	it( 'works for nodes in an iframe', done => {
		const iframe = document.createElement( 'iframe' );

		iframe.addEventListener( 'load', () => {
			const iframeDocument = iframe.contentWindow.document;

			expect( isDomNode( iframeDocument ) ).to.be.true;
			expect( isDomNode( iframeDocument.createElement( 'div' ) ) ).to.be.true;
			expect( isDomNode( iframeDocument.createTextNode( 'Foo' ) ) ).to.be.true;

			expect( isDomNode( iframe.contentWindow ) ).to.be.false;

			iframe.remove();
			done();
		} );

		document.body.appendChild( iframe );
	} );
} );
