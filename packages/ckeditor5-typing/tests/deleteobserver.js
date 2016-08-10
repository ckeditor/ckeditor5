/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */

import DeleteObserver from '/ckeditor5/typing/deleteobserver.js';
import ViewDocument from '/ckeditor5/engine/view/document.js';
import DomEventData from '/ckeditor5/engine/view/observer/domeventdata.js';
import { getCode } from '/ckeditor5/utils/keyboard.js';

describe( 'DeleteObserver', () => {
	let viewDocument, observer;

	beforeEach( () => {
		viewDocument = new ViewDocument();
		observer = viewDocument.addObserver( DeleteObserver );
	} );

	// See ckeditor/ckeditor5-enter#10.
	it( 'can be initialized', () => {
		expect( () => {
			viewDocument.createRoot( document.createElement( 'div' ) );
		} ).to.not.throw();
	} );

	describe( 'delete event', () => {
		it( 'is fired on keydown', () => {
			const spy = sinon.spy();

			viewDocument.on( 'delete', spy );

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'delete' )
			} ) );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data ).to.have.property( 'direction', 'forward' );
			expect( data ).to.have.property( 'unit', 'character' );
		} );

		it( 'is fired with a proper direction and unit', () => {
			const spy = sinon.spy();

			viewDocument.on( 'delete', spy );

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: getCode( 'backspace' ),
				altKey: true
			} ) );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data ).to.have.property( 'direction', 'backward' );
			expect( data ).to.have.property( 'unit', 'word' );
		} );

		it( 'is not fired on keydown when keyCode does not match backspace or delete', () => {
			const spy = sinon.spy();

			viewDocument.on( 'delete', spy );

			viewDocument.fire( 'keydown', new DomEventData( viewDocument, getDomEvent(), {
				keyCode: 1
			} ) );

			expect( spy.calledOnce ).to.be.false;
		} );
	} );

	function getDomEvent() {
		return {
			preventDefault: sinon.spy()
		};
	}
} );
