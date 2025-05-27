/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

import FocusObserver from '../../../src/view/observer/focusobserver.js';
import View from '../../../src/view/view.js';
import createViewRoot from '../_utils/createroot.js';
import { setData } from '../../../src/dev-utils/view.js';
import { StylesProcessor } from '../../../src/view/stylesmap.js';

describe( 'FocusObserver', () => {
	let view, viewDocument, observer;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		view = new View( new StylesProcessor() );
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

		it( 'should render document after focus (after the next view change block)', () => {
			const clock = sinon.useFakeTimers();
			const renderSpy = sinon.spy();
			view.on( 'render', renderSpy );
			viewDocument.isFocused = false;

			observer.onDomEvent( { type: 'focus', target: document.body } );
			clock.tick( 50 );

			view.change( () => {} );

			sinon.assert.calledOnce( renderSpy );
		} );

		it( 'should render document after blurring (after the next view change block)', () => {
			const renderSpy = sinon.spy();
			view.on( 'render', renderSpy );
			viewDocument.isFocused = true;

			observer.onDomEvent( { type: 'blur', target: document.body } );
			view.change( () => {} );

			sinon.assert.calledOnce( renderSpy );
		} );
	} );

	describe( 'handle isFocused property of the document', () => {
		let domMain, domHeader, viewMain, clock;

		beforeEach( () => {
			clock = sinon.useFakeTimers();

			domMain = document.createElement( 'div' );
			domHeader = document.createElement( 'h1' );

			viewMain = createViewRoot( viewDocument );
			view.attachDomRoot( domMain );
		} );

		afterEach( () => {
			clock.restore();
		} );

		it( 'should set isFocused to true on focus after 50ms', () => {
			observer.onDomEvent( { type: 'focus', target: domMain } );

			clock.tick( 50 );

			expect( viewDocument.isFocused ).to.equal( true );
		} );

		it( 'should set isFocused to false on blur', () => {
			observer.onDomEvent( { type: 'focus', target: domMain } );

			clock.tick( 50 );

			expect( viewDocument.isFocused ).to.equal( true );

			observer.onDomEvent( { type: 'blur', target: domMain } );

			expect( viewDocument.isFocused ).to.be.false;
		} );

		it( 'should set isFocused to false on blur when selection in same editable', () => {
			view.change( writer => {
				writer.setSelection( viewMain, 0 );
			} );

			observer.onDomEvent( { type: 'focus', target: domMain } );

			clock.tick( 50 );

			expect( viewDocument.isFocused ).to.equal( true );

			observer.onDomEvent( { type: 'blur', target: domMain } );

			expect( viewDocument.isFocused ).to.be.false;
		} );

		it( 'should not set isFocused to false on blur when it is fired on other editable', () => {
			view.change( writer => {
				writer.setSelection( viewMain, 0 );
			} );

			observer.onDomEvent( { type: 'focus', target: domMain } );

			clock.tick( 50 );

			expect( viewDocument.isFocused ).to.equal( true );

			observer.onDomEvent( { type: 'blur', target: domHeader } );

			expect( viewDocument.isFocused ).to.be.true;
		} );

		it( 'should trigger fallback rendering after 50ms', () => {
			const renderSpy = sinon.spy();
			view.on( 'render', renderSpy );

			observer.onDomEvent( { type: 'focus', target: domMain } );
			sinon.assert.notCalled( renderSpy );
			clock.tick( 50 );
			sinon.assert.called( renderSpy );
		} );

		it( 'should not call render if destroyed', () => {
			const renderSpy = sinon.spy();
			view.on( 'render', renderSpy );

			observer.onDomEvent( { type: 'focus', target: domMain } );
			sinon.assert.notCalled( renderSpy );
			observer.destroy();
			clock.tick( 50 );
			sinon.assert.notCalled( renderSpy );
		} );

		it( 'should not update isFocused when focusing has been cancelled', () => {
			const renderSpy = sinon.spy();
			view.on( 'render', renderSpy );

			observer.onDomEvent( { type: 'focus', target: domMain } );

			observer._isFocusChanging = false;

			clock.tick( 50 );

			expect( viewDocument.isFocused ).to.be.false;
		} );

		it( 'should set isFocused to true on beforeinput after 50ms', () => {
			expect( viewDocument.isFocused ).to.be.false;

			observer.onDomEvent( { type: 'beforeinput', target: domMain } );
			expect( viewDocument.isFocused ).to.be.false;

			clock.tick( 50 );
			expect( viewDocument.isFocused ).to.be.true;
		} );

		it( 'should set isFocused to true on beforeinput after flush', () => {
			expect( viewDocument.isFocused ).to.be.false;

			observer.onDomEvent( { type: 'beforeinput', target: domMain } );
			expect( viewDocument.isFocused ).to.be.false;

			observer.flush();
			expect( viewDocument.isFocused ).to.be.true;
		} );

		it( 'should not set isFocused to true on beforeinput on other element after 50ms', () => {
			expect( viewDocument.isFocused ).to.be.false;

			observer.onDomEvent( { type: 'beforeinput', target: document } );
			expect( viewDocument.isFocused ).to.be.false;

			clock.tick( 50 );
			expect( viewDocument.isFocused ).to.be.true;
		} );

		it( 'should not set isFocused to true on beforeinput on focused document after 50ms', () => {
			viewDocument.isFocused = true;

			observer.onDomEvent( { type: 'beforeinput', target: document } );
			expect( viewDocument.isFocused ).to.be.true;

			clock.tick( 50 );
			expect( viewDocument.isFocused ).to.be.true;
		} );
	} );

	describe( 'handle _isFocusChanging property of the document', () => {
		let domMain, viewMain;

		beforeEach( () => {
			domMain = document.createElement( 'div' );

			viewMain = createViewRoot( viewDocument );
			view.attachDomRoot( domMain );
		} );

		it( 'should set _isFocusChanging to true on focus', () => {
			view.change( writer => {
				writer.setSelection( viewMain, 0 );
			} );

			observer.onDomEvent( { type: 'focus', target: domMain } );

			expect( observer._isFocusChanging ).to.equal( true );
		} );

		it( 'should set _isFocusChanging to false after 50ms', () => {
			const renderSpy = sinon.spy();
			view.on( 'render', renderSpy );
			const clock = sinon.useFakeTimers();

			observer.onDomEvent( { type: 'focus', target: domMain } );

			sinon.assert.notCalled( renderSpy );
			expect( observer._isFocusChanging ).to.equal( true );

			clock.tick( 50 );

			sinon.assert.called( renderSpy );
			expect( observer._isFocusChanging ).to.equal( false );

			clock.restore();
		} );
	} );

	describe( 'flush method', () => {
		it( 'should set the focus properties', () => {
			viewDocument.isFocused = false;
			observer._isFocusChanging = true;

			observer.flush();

			expect( viewDocument.isFocused ).to.be.true;
			expect( observer._isFocusChanging ).to.be.false;
		} );

		it( 'should do nothing when the _isFocusChanging property is false', () => {
			viewDocument.isFocused = false;
			observer._isFocusChanging = false;

			observer.flush();

			expect( viewDocument.isFocused ).to.be.false;
			expect( observer._isFocusChanging ).to.be.false;
		} );
	} );

	describe( 'integration test', () => {
		let viewDocument, domRoot, observer;

		beforeEach( () => {
			domRoot = document.createElement( 'div' );
			document.body.appendChild( domRoot );

			view = new View( new StylesProcessor() );
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
			view.change( () => {} );
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
			view.change( () => {} );
		} );
	} );
} );
