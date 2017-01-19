/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import ClickObserver from '../../../src/view/observer/clickobserver';
import ViewDocument from '../../../src/view/document';

describe( 'ClickObserver', () => {
	let viewDocument, observer;

	beforeEach( () => {
		viewDocument = new ViewDocument();
		observer = viewDocument.addObserver( ClickObserver );
	} );

	afterEach( () => {
		viewDocument.destroy();
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
