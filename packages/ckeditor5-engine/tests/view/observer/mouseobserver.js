/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import MouseObserver from '../../../src/view/observer/mouseobserver.js';
import View from '../../../src/view/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'MouseObserver', () => {
	let view, viewDocument, observer;

	beforeEach( () => {
		view = new View( new StylesProcessor() );
		viewDocument = view.document;
		observer = view.addObserver( MouseObserver );
	} );

	afterEach( () => {
		view.destroy();
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.deep.equal( [ 'mousedown', 'mouseup', 'mouseover', 'mouseout' ] );
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

		it( 'should fire mouseup with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'mouseup', spy );

			observer.onDomEvent( { type: 'mouseup', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );

		it( 'should fire mouseover with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'mouseover', spy );

			observer.onDomEvent( { type: 'mouseover', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );

		it( 'should fire mouseout with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'mouseout', spy );

			observer.onDomEvent( { type: 'mouseout', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );
	} );
} );
