/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import Document from '../../../src/view/document';
import ViewElement from '../../../src/view/element';
import { isBlockFiller, BR_FILLER } from '../../../src/view/filler';

import createElement from '@ckeditor/ckeditor5-utils/src/dom/createelement';

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

		viewDocument.destroy();
	} );

	it( 'should render changes in the Document', () => {
		const domDiv = document.createElement( 'div' );

		const viewDocument = new Document();
		viewDocument.createRoot( domDiv );

		viewDocument.getRoot().appendChildren( new ViewElement( 'p' ) );
		viewDocument.render();

		expect( domDiv.childNodes.length ).to.equal( 1 );
		expect( domDiv.childNodes[ 0 ].tagName ).to.equal( 'P' );

		viewDocument.destroy();
	} );

	it( 'should render attribute changes', () => {
		const domRoot = document.createElement( 'div' );

		const viewDocument = new Document();
		const viewRoot = viewDocument.createRoot( domRoot );

		const viewP = new ViewElement( 'p', { class: 'foo' } );
		viewRoot.appendChildren( viewP );
		viewDocument.render();

		expect( domRoot.childNodes.length ).to.equal( 1 );
		expect( domRoot.childNodes[ 0 ].getAttribute( 'class' ) ).to.equal( 'foo' );

		viewP.setAttribute( 'class', 'bar' );
		viewDocument.render();

		expect( domRoot.childNodes.length ).to.equal( 1 );
		expect( domRoot.childNodes[ 0 ].getAttribute( 'class' ) ).to.equal( 'bar' );

		viewDocument.destroy();
	} );
} );
