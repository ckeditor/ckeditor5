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

	describe( 'handle isFocused property of root elements', () => {
		let domMain, domHeader, viewMain, viewHeader;

		beforeEach( () => {
			domMain = document.createElement( 'div' );
			domHeader = document.createElement( 'h1' );

			viewMain = viewDocument.createRoot( domMain );
			viewHeader = viewDocument.createRoot( domHeader, 'header' );
		} );

		it( 'should change isFocused on focus event', () => {
			observer.onDomEvent( { type: 'focus', target: domMain } );

			expect( viewMain.isFocused ).to.be.true;
			expect( viewHeader.isFocused ).to.be.false;
		} );

		it( 'should change isFocused on blur event', () => {
			observer.onDomEvent( { type: 'focus', target: domMain } );

			expect( viewMain.isFocused ).to.be.true;
			expect( viewHeader.isFocused ).to.be.false;

			observer.onDomEvent( { type: 'blur', target: domMain } );
			observer.onDomEvent( { type: 'focus', target: domHeader } );

			expect( viewMain.isFocused ).to.be.false;
			expect( viewHeader.isFocused ).to.be.true;
		} );
	} );

	describe( 'handle focusedEditable property of the document', () => {
		let domMain, domHeader, viewMain, viewHeader;

		beforeEach( () => {
			domMain = document.createElement( 'div' );
			domHeader = document.createElement( 'h1' );

			viewMain = viewDocument.createRoot( domMain );
			viewHeader = viewDocument.createRoot( domHeader, 'header' );
		} );

		it( 'should set focusedEditable on focus', () => {
			observer.onDomEvent( { type: 'focus', target: domMain } );

			expect( viewDocument.focusedEditable ).to.equal( viewMain );
		} );

		it( 'should change focusedEditable on focus', () => {
			observer.onDomEvent( { type: 'focus', target: domMain } );

			expect( viewDocument.focusedEditable ).to.equal( viewMain );

			observer.onDomEvent( { type: 'focus', target: domHeader } );

			expect( viewDocument.focusedEditable ).to.equal( viewHeader );
		} );

		it( 'should set focusedEditable to null on blur', () => {
			observer.onDomEvent( { type: 'focus', target: domMain } );

			expect( viewDocument.focusedEditable ).to.equal( viewMain );

			observer.onDomEvent( { type: 'blur', target: domMain } );

			expect( viewDocument.focusedEditable ).to.be.null;
		} );

		it( 'should not touch focusedEditable on blur if it is already changed', () => {
			observer.onDomEvent( { type: 'focus', target: domMain } );

			expect( viewDocument.focusedEditable ).to.equal( viewMain );

			observer.onDomEvent( { type: 'focus', target: domHeader } );
			observer.onDomEvent( { type: 'blur', target: domMain } );

			expect( viewDocument.focusedEditable ).to.equal( viewHeader );
		} );
	} );
} );
