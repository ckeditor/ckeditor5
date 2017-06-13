/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals MouseEvent, document */

import DomEventObserver from '../../../src/view/observer/domeventobserver';
import Observer from '../../../src/view/observer/observer';
import ViewDocument from '../../../src/view/document';
import UIElement from '../../../src/view/uielement';

class ClickObserver extends DomEventObserver {
	constructor( document ) {
		super( document );

		this.domEventType = 'click';
	}

	onDomEvent( domEvt ) {
		this.fire( 'click', domEvt, { foo: 1, bar: 2 } );
	}
}

class MultiObserver extends DomEventObserver {
	constructor( document ) {
		super( document );

		this.domEventType = [ 'evt1', 'evt2' ];
	}

	onDomEvent( domEvt ) {
		this.fire( domEvt.type, domEvt );
	}
}

class ClickCapturingObserver extends ClickObserver {
	constructor( document ) {
		super( document );

		this.useCapture = true;
	}
}

describe( 'DomEventObserver', () => {
	let viewDocument;

	beforeEach( () => {
		viewDocument = new ViewDocument();
	} );

	afterEach( () => {
		viewDocument.destroy();
	} );

	describe( 'constructor()', () => {
		it( 'should create Observer with properties', () => {
			const observer = new DomEventObserver( viewDocument );

			expect( observer ).to.be.an.instanceof( Observer );
		} );
	} );

	it( 'should add event listener', () => {
		const domElement = document.createElement( 'p' );
		const domEvent = new MouseEvent( 'click' );
		const evtSpy = sinon.spy();

		viewDocument.createRoot( domElement, 'root' );
		viewDocument.addObserver( ClickObserver );
		viewDocument.on( 'click', evtSpy );

		domElement.dispatchEvent( domEvent );

		expect( evtSpy.calledOnce ).to.be.true;

		const data = evtSpy.args[ 0 ][ 1 ];

		expect( data ).to.have.property( 'foo', 1 );
		expect( data ).to.have.property( 'bar', 2 );
		expect( data ).to.have.property( 'domEvent', domEvent );
	} );

	it( 'should add multiple event listeners', () => {
		const domElement = document.createElement( 'p' );
		const domEvent1 = new MouseEvent( 'evt1' );
		const domEvent2 = new MouseEvent( 'evt2' );
		const evtSpy1 = sinon.spy();
		const evtSpy2 = sinon.spy();

		viewDocument.createRoot( domElement, 'root' );
		viewDocument.addObserver( MultiObserver );
		viewDocument.on( 'evt1', evtSpy1 );
		viewDocument.on( 'evt2', evtSpy2 );

		domElement.dispatchEvent( domEvent1 );
		expect( evtSpy1.calledOnce ).to.be.true;

		domElement.dispatchEvent( domEvent2 );
		expect( evtSpy2.calledOnce ).to.be.true;
	} );

	it( 'should not fire event if observer is disabled', () => {
		const domElement = document.createElement( 'p' );
		const domEvent = new MouseEvent( 'click' );
		const evtSpy = sinon.spy();

		viewDocument.createRoot( domElement, 'root' );
		const testObserver = viewDocument.addObserver( ClickObserver );
		viewDocument.on( 'click', evtSpy );

		testObserver.disable();

		domElement.dispatchEvent( domEvent );

		expect( evtSpy.called ).to.be.false;
	} );

	it( 'should fire event if observer is disabled and re-enabled', () => {
		const domElement = document.createElement( 'p' );
		const domEvent = new MouseEvent( 'click' );
		const evtSpy = sinon.spy();

		viewDocument.createRoot( domElement, 'root' );
		const testObserver = viewDocument.addObserver( ClickObserver );
		viewDocument.on( 'click', evtSpy );

		testObserver.disable();

		domElement.dispatchEvent( domEvent );

		expect( evtSpy.called ).to.be.false;

		testObserver.enable();

		domElement.dispatchEvent( domEvent );

		expect( evtSpy.calledOnce ).to.be.true;
	} );

	it( 'should allow to listen events on capturing phase', done => {
		const domElement = document.createElement( 'div' );
		const childDomElement = document.createElement( 'p' );
		const domEvent = new MouseEvent( 'click' );
		domElement.appendChild( childDomElement );
		viewDocument.createRoot( domElement, 'root' );
		viewDocument.addObserver( ClickCapturingObserver );

		viewDocument.on( 'click', ( evt, domEventData ) => {
			expect( domEventData.domEvent.eventPhase ).to.equal( domEventData.domEvent.CAPTURING_PHASE );
			done();
		} );

		childDomElement.dispatchEvent( domEvent );
	} );

	describe( 'integration with UIElement', () => {
		let domRoot, domEvent, evtSpy, uiElement;

		class MyUIElement extends UIElement {
			render( domDocument ) {
				const root = super.render( domDocument );
				root.innerHTML = '<span>foo bar</span>';

				return root;
			}
		}

		beforeEach( () => {
			domRoot = document.createElement( 'div' );
			const viewRoot = viewDocument.createRoot( domRoot, 'root' );
			uiElement = new MyUIElement( 'p' );
			viewRoot.appendChildren( uiElement );
			viewDocument.render();

			domEvent = new MouseEvent( 'click', { bubbles: true } );
			evtSpy = sinon.spy();
			viewDocument.addObserver( ClickObserver );
			viewDocument.on( 'click', evtSpy );
		} );

		it( 'should fire events from UIElement itself', () => {
			const domUiElement = domRoot.querySelector( 'p' );
			domUiElement.dispatchEvent( domEvent );

			const data = evtSpy.args[ 0 ][ 1 ];

			sinon.assert.calledOnce( evtSpy );
			expect( data.target ).to.equal( uiElement );
		} );

		it( 'events from inside of UIElement should target UIElement', () => {
			const domUiElementChild = domRoot.querySelector( 'span' );
			domUiElementChild.dispatchEvent( domEvent );

			const data = evtSpy.args[ 0 ][ 1 ];

			sinon.assert.calledOnce( evtSpy );
			expect( data.target ).to.equal( uiElement );
		} );
	} );

	describe( 'fire', () => {
		it( 'should do nothing if observer is disabled', () => {
			const testObserver = new ClickObserver( viewDocument );
			const fireSpy = sinon.spy( viewDocument, 'fire' );

			testObserver.disable();

			testObserver.fire( 'click', {} );

			expect( fireSpy.called ).to.be.false;

			testObserver.enable();

			testObserver.fire( 'click', {} );

			expect( fireSpy.calledOnce ).to.be.true;
		} );
	} );
} );
