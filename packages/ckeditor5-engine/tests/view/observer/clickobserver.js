/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */
/* bender-tags: view, browser-only */

import ClickObserver from '/ckeditor5/engine/view/observer/clickobserver.js';
import ViewDocument from '/ckeditor5/engine/view/document.js';

describe( 'ClickObserver', () => {
	let viewDocument, observer;

	beforeEach( () => {
		viewDocument = new ViewDocument();
		observer = viewDocument.getObserver( ClickObserver );
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.equal( 'click' );
	} );

	describe( 'onDomEvent', () => {
		it( 'should fire click with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'click', spy );

			observer.onDomEvent( { type: 'click', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );
	} );
} );
