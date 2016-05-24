/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

'use strict';

import Document from '/ckeditor5/engine/view/document.js';
import ViewElement from '/ckeditor5/engine/view/element.js';
import { isBlockFiller, BR_FILLER } from '/ckeditor5/engine/view/filler.js';

import createElement from '/ckeditor5/utils/dom/createelement.js';

describe( 'Document integration', () => {
	it( 'should remove content of the DOM', () => {
		const domDiv = createElement( document, 'div', { id: 'editor' }, [
			createElement( document, 'p' ),
			createElement( document, 'p' )
		] );

		const viewDocument = new Document();
		viewDocument.createRoot( domDiv );
		viewDocument.render();

		expect( domDiv.childNodes.length ).to.equal( 1 );
		expect( isBlockFiller( domDiv.childNodes[ 0 ], BR_FILLER ) ).to.be.true;
	} );

	it( 'should render changes in the Document', () => {
		const domDiv = document.createElement( 'div' );

		const viewDocument = new Document();
		viewDocument.createRoot( domDiv );

		viewDocument.getRoot().appendChildren( new ViewElement( 'p' ) );
		viewDocument.render();

		expect( domDiv.childNodes.length ).to.equal( 1 );
		expect( domDiv.childNodes[ 0 ].tagName ).to.equal( 'P' );
	} );
} );
