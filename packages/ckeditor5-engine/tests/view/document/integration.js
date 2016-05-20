/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

'use strict';

import Document from '/ckeditor5/engine/view/document.js';
import ViewElement from '/ckeditor5/engine/view/element.js';

describe( 'Document integration', () => {
	it( 'should remove content of the DOM', () => {
		const domP = document.createElement( 'p' );
		const domDiv = document.createElement( 'div' );
		domDiv.setAttribute( 'id', 'editor' );
		domDiv.appendChild( domP );

		const viewDocument = new Document();
		viewDocument.createRoot( domDiv, 'editor' );
		viewDocument.render();

		expect( domDiv.childNodes.length ).to.equal( 0 );
		expect( domDiv.getAttribute( 'id' ) ).to.equal( 'editor' );
	} );

	it( 'should render changes in the Document', () => {
		const domDiv = document.createElement( 'div' );

		const viewDocument = new Document();
		viewDocument.createRoot( domDiv, 'editor' );

		viewDocument.viewRoots.get( 'editor' ).appendChildren( new ViewElement( 'p' ) );
		viewDocument.render();

		expect( domDiv.childNodes.length ).to.equal( 1 );
		expect( domDiv.childNodes[ 0 ].tagName ).to.equal( 'P' );
	} );
} );
