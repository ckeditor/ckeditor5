/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

'use strict';

import DomEventData from '/ckeditor5/engine/view/observer/domeventdata.js';
import ViewDocument from '/ckeditor5/engine/view/document.js';

describe( 'DomEventData', () => {
	let viewDocument, viewBody;

	beforeEach( () => {
		viewDocument = new ViewDocument();

		viewBody = viewDocument.domConverter.domToView( document.body, { bind: true } );
	} );

	describe( 'constructor', () => {
		it( 'sets properties', () => {
			const domEvt = { target: document.body };
			const data = new DomEventData( viewDocument, domEvt, { foo: 1, bar: true } );

			expect( data ).to.have.property( 'document', viewDocument );
			expect( data ).to.have.property( 'domEvent', domEvt );
			expect( data ).to.have.property( 'domTarget', document.body );

			expect( data ).to.have.property( 'foo', 1 );
			expect( data ).to.have.property( 'bar', true );
		} );
	} );

	describe( 'target', () => {
		it( 'returns bound element', () => {
			const domEvt = { target: document.body };
			const data = new DomEventData( viewDocument, domEvt );

			expect( data ).to.have.property( 'target', viewBody );
		} );
	} );

	describe( 'preventDefault', () => {
		it( 'executes native preventDefault()', () => {
			const domEvt = { target: document.body, preventDefault: sinon.spy() };
			const data = new DomEventData( viewDocument, domEvt );

			data.preventDefault();

			expect( domEvt.preventDefault.calledOnce ).to.be.true;
		} );
	} );

	describe( 'stopPropagation', () => {
		it( 'executes native stopPropagation()', () => {
			const domEvt = { target: document.body, stopPropagation: sinon.spy() };
			const data = new DomEventData( viewDocument, domEvt );

			data.stopPropagation();

			expect( domEvt.stopPropagation.calledOnce ).to.be.true;
		} );
	} );
} );
