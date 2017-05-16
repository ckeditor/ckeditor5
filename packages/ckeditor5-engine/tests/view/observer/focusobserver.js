/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document, window */
import FocusObserver from '../../../src/view/observer/focusobserver';
import ViewDocument from '../../../src/view/document';
import ViewRange from '../../../src/view/range';
import { setData } from '../../../src/dev-utils/view';

describe( 'FocusObserver', () => {
	let viewDocument, observer;

	beforeEach( () => {
		viewDocument = new ViewDocument();
		observer = viewDocument.getObserver( FocusObserver );
	} );

	afterEach( () => {
		viewDocument.destroy();
	} );

	it( 'should define domEventType', () => {
		expect( observer.domEventType ).to.deep.equal( [ 'focus', 'blur' ] );
	} );

	it( 'should use capturing phase', () => {
		expect( observer.useCapture ).to.be.true;
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

		it( 'should render document after blurring', () => {
			const renderSpy = sinon.spy( viewDocument, 'render' );

			observer.onDomEvent( { type: 'blur', target: document.body } );

			sinon.assert.calledOnce( renderSpy );
		} );
	} );

	describe( 'handle isFocused property of the document', () => {
		let domMain, domHeader, viewMain;

		beforeEach( () => {
			domMain = document.createElement( 'div' );
			domHeader = document.createElement( 'h1' );

			viewMain = viewDocument.createRoot( domMain );
		} );

		it( 'should set isFocused to true on focus', () => {
			observer.onDomEvent( { type: 'focus', target: domMain } );

			expect( viewDocument.isFocused ).to.equal( true );
		} );

		it( 'should set isFocused to false on blur', () => {
			observer.onDomEvent( { type: 'focus', target: domMain } );

			expect( viewDocument.isFocused ).to.equal( true );

			observer.onDomEvent( { type: 'blur', target: domMain } );

			expect( viewDocument.isFocused ).to.be.false;
		} );

		it( 'should set isFocused to false on blur when selection in same editable', () => {
			viewDocument.selection.addRange( ViewRange.createFromParentsAndOffsets( viewMain, 0, viewMain, 0 ) );

			observer.onDomEvent( { type: 'focus', target: domMain } );

			expect( viewDocument.isFocused ).to.equal( true );

			observer.onDomEvent( { type: 'blur', target: domMain } );

			expect( viewDocument.isFocused ).to.be.false;
		} );

		it( 'should not set isFocused to false on blur when it is fired on other editable', () => {
			viewDocument.selection.addRange( ViewRange.createFromParentsAndOffsets( viewMain, 0, viewMain, 0 ) );

			observer.onDomEvent( { type: 'focus', target: domMain } );

			expect( viewDocument.isFocused ).to.equal( true );

			observer.onDomEvent( { type: 'blur', target: domHeader } );

			expect( viewDocument.isFocused ).to.be.true;
		} );

		it( 'should delay rendering to the next iteration of event loop', () => {
			const renderSpy = sinon.spy( viewDocument, 'render' );
			const clock = sinon.useFakeTimers();

			observer.onDomEvent( { type: 'focus', target: domMain } );
			sinon.assert.notCalled( renderSpy );
			clock.tick( 0 );
			sinon.assert.called( renderSpy );

			clock.restore();
		} );

		it( 'should not call render if destroyed', () => {
			const renderSpy = sinon.spy( viewDocument, 'render' );
			const clock = sinon.useFakeTimers();

			observer.onDomEvent( { type: 'focus', target: domMain } );
			sinon.assert.notCalled( renderSpy );
			observer.destroy();
			clock.tick( 0 );
			sinon.assert.notCalled( renderSpy );

			clock.restore();
		} );
	} );

	describe( 'integration test', () => {
		let viewDocument, domRoot, observer, domSelection;

		beforeEach( () => {
			domRoot = document.createElement( 'div' );
			document.body.appendChild( domRoot );

			viewDocument = new ViewDocument();
			viewDocument.createRoot( domRoot );

			observer = viewDocument.getObserver( FocusObserver );
			domSelection = window.getSelection();
		} );

		it( 'should render document after selectionChange event', done => {
			const selectionChangeSpy = sinon.spy();
			const renderSpy = sinon.spy();

			setData( viewDocument, '<div contenteditable="true">foo bar</div>' );
			viewDocument.render();
			const domEditable = domRoot.childNodes[ 0 ];

			viewDocument.on( 'selectionChange', selectionChangeSpy );
			viewDocument.on( 'render', renderSpy, { priority: 'low' } );

			viewDocument.on( 'render', () => {
				sinon.assert.callOrder( selectionChangeSpy, renderSpy );
				done();
			}, { priority: 'low' } );

			observer.onDomEvent( { type: 'focus', target: domEditable } );
			domSelection.collapse( domEditable, 0 );
		} );

		it( 'should render without selectionChange event', done => {
			const selectionChangeSpy = sinon.spy();
			const renderSpy = sinon.spy();

			setData( viewDocument, '<div contenteditable="true">foo bar</div>' );
			viewDocument.render();
			const domEditable = domRoot.childNodes[ 0 ];

			viewDocument.on( 'selectionChange', selectionChangeSpy );
			viewDocument.on( 'render', renderSpy, { priority: 'low' } );

			viewDocument.on( 'render', () => {
				sinon.assert.notCalled( selectionChangeSpy );
				sinon.assert.called( renderSpy );

				done();
			}, { priority: 'low' } );

			observer.onDomEvent( { type: 'focus', target: domEditable } );
		} );
	} );
} );
