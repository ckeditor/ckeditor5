/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */
/* bender-tags: view, browser-only */

import MouseObserver from 'ckeditor5/engine/view/observer/mouseobserver.js';
import ViewDocument from 'ckeditor5/engine/view/document.js';

describe( 'MouseObserver', () => {
	let viewDocument, observer;

	beforeEach( () => {
		viewDocument = new ViewDocument();
		observer = viewDocument.addObserver( MouseObserver );
	} );

	afterEach( () => {
		viewDocument.destroy();
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.equal( 'mousedown' );
	} );

	describe( 'onDomEvent', () => {
		it( 'should fire mousedown with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'mousedown', spy );

			observer.onDomEvent( { type: 'mousedown', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );
	} );
} );
