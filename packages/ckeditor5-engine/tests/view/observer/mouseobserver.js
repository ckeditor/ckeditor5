/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import MouseObserver from '../../../src/view/observer/mouseobserver';
import View from '../../../src/view/view';
import { StylesProcessor } from '../../../src/view/stylesmap';

describe( 'MouseObserver', () => {
	let view, viewDocument, observer;
	let stylesProcessor;

	before( () => {
		stylesProcessor = new StylesProcessor();
	} );

	beforeEach( () => {
		view = new View( stylesProcessor );
		viewDocument = view.document;
		observer = view.addObserver( MouseObserver );
	} );

	afterEach( () => {
		view.destroy();
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
