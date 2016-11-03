/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */
/* bender-tags: view, browser-only */

import DomEventData from 'ckeditor5/engine/view/observer/domeventdata.js';
import ViewDocument from 'ckeditor5/engine/view/document.js';

describe( 'DomEventData', () => {
	let viewDocument, viewBody, domRoot;

	// Todo: the whole `before` hook can be removed.
	// Depends on: https://github.com/ckeditor/ckeditor5-engine/issues/647
	before( () => {
		for ( const node of document.body.childNodes ) {
			// Remove all <!-- Comments -->
			if ( node.nodeType === 8 ) {
				document.body.removeChild( node );
			}
		}
	} );

	beforeEach( () => {
		viewDocument = new ViewDocument();

		domRoot = document.createElement( 'div' );
		domRoot.innerHTML = `<div contenteditable="true" id="main"></div><div contenteditable="true" id="additional"></div>`;
		document.body.appendChild( domRoot );

		viewBody = viewDocument.domConverter.domToView( document.body, { bind: true } );
	} );

	afterEach( () => {
		domRoot.parentElement.removeChild( domRoot );
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
