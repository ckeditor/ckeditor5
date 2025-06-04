/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import TouchObserver from '../../../src/view/observer/touchobserver.js';
import View from '../../../src/view/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'TouchObserver', () => {
	let view, viewDocument, observer;

	beforeEach( () => {
		view = new View( new StylesProcessor() );
		viewDocument = view.document;
		observer = view.addObserver( TouchObserver );
	} );

	afterEach( () => {
		view.destroy();
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.deep.equal( [ 'touchstart', 'touchend', 'touchmove' ] );
	} );

	describe( 'onDomEvent', () => {
		it( 'should fire touchstart with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'touchstart', spy );

			observer.onDomEvent( { type: 'touchstart', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );

		it( 'should fire touchend with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'touchend', spy );

			observer.onDomEvent( { type: 'touchend', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );

		it( 'should fire touchmove with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'touchmove', spy );

			observer.onDomEvent( { type: 'touchmove', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );
	} );
} );
