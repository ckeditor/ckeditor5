/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import View from '@ckeditor/ckeditor5-engine/src/view/view';
import MouseEventsObserver from '../../src/tableselection/mouseeventsobserver';

describe( 'table selection', () => {
	describe( 'MouseEventsObserver', () => {
		let view, viewDocument, observer;

		beforeEach( () => {
			view = new View();
			viewDocument = view.document;
			observer = view.addObserver( MouseEventsObserver );
		} );

		afterEach( () => {
			view.destroy();
		} );

		it( 'should define domEventTypes', () => {
			expect( observer.domEventType ).to.deep.equal( [
				'mousemove',
				'mouseup',
				'mouseleave'
			] );
		} );

		describe( 'onDomEvent', () => {
			for ( const eventName of [ 'mousemove', 'mouseup', 'mouseleave' ] ) {
				it( `should fire ${ eventName } with the right event data`, () => {
					const spy = sinon.spy();

					viewDocument.on( eventName, spy );

					observer.onDomEvent( { type: eventName, target: document.body } );

					expect( spy.calledOnce ).to.be.true;

					const data = spy.args[ 0 ][ 1 ];
					expect( data.domTarget ).to.equal( document.body );
				} );
			}
		} );
	} );
} );
