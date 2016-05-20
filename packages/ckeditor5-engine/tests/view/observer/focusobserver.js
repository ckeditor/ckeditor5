/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

'use strict';

import FocusObserver from '/ckeditor5/engine/view/observer/focusobserver.js';
import ViewDocument from '/ckeditor5/engine/view/document.js';

describe( 'FocusObserver', () => {
	let viewDocument, observer;

	beforeEach( () => {
		viewDocument = new ViewDocument();
		observer = viewDocument.addObserver( FocusObserver );
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.deep.equal( [ 'focus', 'blur' ] );
	} );

	describe( 'onDomEvent', () => {
		it( 'should fire focus with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'focus', spy );

			observer.onDomEvent( { type: 'focus', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );

		it( 'should fire blur with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'blur', spy );

			observer.onDomEvent( { type: 'blur', target: document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( document.body );
		} );
	} );
} );
