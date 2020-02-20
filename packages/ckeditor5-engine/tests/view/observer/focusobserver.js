/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */
import FocusObserver from '../../../src/view/observer/focusobserver';
import View from '../../../src/view/view';
import createViewRoot from '../_utils/createroot';
import { setData } from '../../../src/dev-utils/view';
import { StylesProcessor } from '../../../src/view/stylesmap';

describe( 'FocusObserver', () => {
	let view, viewDocument, observer;
	let stylesProcessor;

	before( () => {
		stylesProcessor = new StylesProcessor();
	} );

	beforeEach( () => {
		view = new View( stylesProcessor );
		viewDocument = view.document;
		observer = view.getObserver( FocusObserver );
	} );

	afterEach( () => {
		view.destroy();
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
			const renderSpy = sinon.spy();
			view.on( 'render', renderSpy );

			observer.onDomEvent( { type: 'blur', target: document.body } );

			sinon.assert.calledOnce( renderSpy );
		} );
	} );

	describe( 'handle isFocused property of the document', () => {
		let domMain, domHeader, viewMain;

		beforeEach( () => {
			domMain = document.createElement( 'div' );
			domHeader = document.createElement( 'h1' );

			viewMain = createViewRoot( viewDocument );
			view.attachDomRoot( domMain );
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
			view.change( writer => {
				writer.setSelection( viewMain, 0 );
			} );

			observer.onDomEvent( { type: 'focus', target: domMain } );

			expect( viewDocument.isFocused ).to.equal( true );

			observer.onDomEvent( { type: 'blur', target: domMain } );

			expect( viewDocument.isFocused ).to.be.false;
		} );

		it( 'should not set isFocused to false on blur when it is fired on other editable', () => {
			view.change( writer => {
				writer.setSelection( viewMain, 0 );
			} );

			observer.onDomEvent( { type: 'focus', target: domMain } );

			expect( viewDocument.isFocused ).to.equal( true );

			observer.onDomEvent( { type: 'blur', target: domHeader } );

			expect( viewDocument.isFocused ).to.be.true;
		} );

		it( 'should delay rendering by 50ms', () => {
			const renderSpy = sinon.spy();
			view.on( 'render', renderSpy );
			const clock = sinon.useFakeTimers();

			observer.onDomEvent( { type: 'focus', target: domMain } );
			sinon.assert.notCalled( renderSpy );
			clock.tick( 50 );
			sinon.assert.called( renderSpy );

			clock.restore();
		} );

		it( 'should not call render if destroyed', () => {
			const renderSpy = sinon.spy();
			view.on( 'render', renderSpy );
			const clock = sinon.useFakeTimers();

			observer.onDomEvent( { type: 'focus', target: domMain } );
			sinon.assert.notCalled( renderSpy );
			observer.destroy();
			clock.tick( 50 );
			sinon.assert.notCalled( renderSpy );

			clock.restore();
		} );
	} );

	describe( 'integration test', () => {
		let viewDocument, domRoot, observer;

		beforeEach( () => {
			domRoot = document.createElement( 'div' );
			document.body.appendChild( domRoot );

			view = new View( stylesProcessor );
			viewDocument = view.document;
			createViewRoot( viewDocument );
			view.attachDomRoot( domRoot );

			observer = view.getObserver( FocusObserver );
		} );

		afterEach( () => {
			view.destroy();
			domRoot.remove();
		} );

		it( 'should always render document after selectionChange event', done => {
			const selectionChangeSpy = sinon.spy();
			const renderSpy = sinon.spy();

			setData( view, '<div contenteditable="true">foo bar</div>' );
			view.forceRender();

			viewDocument.on( 'selectionChange', selectionChangeSpy );
			view.on( 'render', renderSpy );

			view.on( 'render', () => {
				sinon.assert.callOrder( selectionChangeSpy, renderSpy );
				done();
			} );

			// Mock selectionchange event after focus event. Render called by focus observer should be fired after
			// async selection change.
			viewDocument.fire( 'focus' );
			viewDocument.fire( 'selectionChange' );
		} );

		it( 'should render without selectionChange event', done => {
			const selectionChangeSpy = sinon.spy();
			const renderSpy = sinon.spy();

			setData( view, '<div contenteditable="true">foo bar</div>' );
			view.forceRender();
			const domEditable = domRoot.childNodes[ 0 ];

			viewDocument.on( 'selectionChange', selectionChangeSpy );
			view.on( 'render', renderSpy );

			view.on( 'render', () => {
				sinon.assert.notCalled( selectionChangeSpy );
				sinon.assert.called( renderSpy );

				done();
			} );

			observer.onDomEvent( { type: 'focus', target: domEditable } );
		} );
	} );
} );
