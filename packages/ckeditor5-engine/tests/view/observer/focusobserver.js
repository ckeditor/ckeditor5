/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import FocusObserver from '../../../src/view/observer/focusobserver';
import SelectionObserver from '../../../src/view/observer/selectionobserver';
import ViewDocument from '../../../src/view/document';
import ViewRange from '../../../src/view/range';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';

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

			observer.onDomEvent( { type: 'focus', target: global.document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( global.document.body );
		} );

		it( 'should fire blur with the right event data', () => {
			const spy = sinon.spy();

			viewDocument.on( 'blur', spy );

			observer.onDomEvent( { type: 'blur', target: global.document.body } );

			expect( spy.calledOnce ).to.be.true;

			const data = spy.args[ 0 ][ 1 ];
			expect( data.domTarget ).to.equal( global.document.body );
		} );

		it( 'should render document after blurring', () => {
			const renderSpy = sinon.spy( viewDocument, 'render' );

			observer.onDomEvent( { type: 'blur', target: global.document.body } );

			sinon.assert.calledOnce( renderSpy );
		} );
	} );

	describe( 'handle isFocused property of the document', () => {
		let domMain, domHeader, viewMain, viewHeader;

		beforeEach( () => {
			domMain = global.document.createElement( 'div' );
			domHeader = global.document.createElement( 'h1' );

			viewMain = viewDocument.createRoot( domMain );
			viewHeader = viewDocument.createRoot( domHeader, 'header' );
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

		it( 'should call render after selectionChange event is handled', () => {
			const renderSpy = sinon.spy( viewDocument, 'render' );
			const selectionObserver = viewDocument.getObserver( SelectionObserver );

			observer.onDomEvent( { type: 'focus', target: domMain } );
			sinon.assert.notCalled( renderSpy );
			selectionObserver.fire( 'selectionChangeHandling', { domDocument: global.document } );
			sinon.assert.called( renderSpy );
		} );

		it( 'should call render only after first selectionChange after focus', () => {
			const renderSpy = sinon.spy( viewDocument, 'render' );
			const selectionObserver = viewDocument.getObserver( SelectionObserver );

			observer.onDomEvent( { type: 'focus', target: domMain } );
			selectionObserver.fire( 'selectionChangeHandling', { domDocument: global.document } );
			selectionObserver.fire( 'selectionChangeHandling', { domDocument: global.document } );
			sinon.assert.calledOnce( renderSpy );
		} );
	} );
} );
