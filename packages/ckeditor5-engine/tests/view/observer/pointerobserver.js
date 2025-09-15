/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { PointerObserver } from '../../../src/view/observer/pointerobserver.js';
import { EditingView } from '../../../src/view/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'PointerObserver', () => {
	let view, viewDocument, observer;

	beforeEach( () => {
		view = new EditingView( new StylesProcessor() );
		viewDocument = view.document;
		observer = view.addObserver( PointerObserver );
	} );

	afterEach( () => {
		view.destroy();
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.deep.equal( [ 'pointerdown', 'pointerup', 'pointermove' ] );
	} );

	describe( 'onDomEvent', () => {
		it( 'should fire pointerdown with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'pointerdown', spy );

			observer.onDomEvent( { type: 'pointerdown', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );

		it( 'should fire pointerup with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'pointerup', spy );

			observer.onDomEvent( { type: 'pointerup', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );

		it( 'should fire pointermove with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'pointermove', spy );

			observer.onDomEvent( { type: 'pointermove', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );
	} );
} );
