/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals MouseEvent, document */

import DomEventObserver from '../../../src/view/observer/domeventobserver';
import Observer from '../../../src/view/observer/observer';
import View from '../../../src/view/view';
import UIElement from '../../../src/view/uielement';
import createViewRoot from '../_utils/createroot';
import { StylesProcessor } from '../../../src/view/stylesmap';

class ClickObserver extends DomEventObserver {
	constructor( view ) {
		super( view );

		this.domEventType = 'click';
	}

	onDomEvent( domEvt ) {
		this.fire( 'click', domEvt, { foo: 1, bar: 2 } );
	}
}

class MultiObserver extends DomEventObserver {
	constructor( view ) {
		super( view );

		this.domEventType = [ 'evt1', 'evt2' ];
	}

	onDomEvent( domEvt ) {
		this.fire( domEvt.type, domEvt );
	}
}

class ClickCapturingObserver extends ClickObserver {
	constructor( view ) {
		super( view );

		this.useCapture = true;
	}
}

describe( 'DomEventObserver', () => {
	let view, viewDocument, stylesProcessor;

	beforeEach( () => {
		stylesProcessor = new StylesProcessor();
		view = new View( stylesProcessor );
		viewDocument = view.document;
	} );

	afterEach( () => {
		view.destroy();
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

		createViewRoot( viewDocument );
		view.attachDomRoot( domElement );
		view.addObserver( ClickObserver );
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

		createViewRoot( viewDocument );
		view.attachDomRoot( domElement );
		view.addObserver( MultiObserver );
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

		createViewRoot( viewDocument );
		view.attachDomRoot( domElement );
		const testObserver = view.addObserver( ClickObserver );
		viewDocument.on( 'click', evtSpy );

		testObserver.disable();

		domElement.dispatchEvent( domEvent );

		expect( evtSpy.called ).to.be.false;
	} );

	it( 'should fire event if observer is disabled and re-enabled', () => {
		const domElement = document.createElement( 'p' );
		const domEvent = new MouseEvent( 'click' );
		const evtSpy = sinon.spy();

		createViewRoot( viewDocument );
		view.attachDomRoot( domElement );
		const testObserver = view.addObserver( ClickObserver );
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
		createViewRoot( viewDocument );
		view.attachDomRoot( domElement );
		view.addObserver( ClickCapturingObserver );

		viewDocument.on( 'click', ( evt, domEventData ) => {
			expect( domEventData.domEvent.eventPhase ).to.equal( domEventData.domEvent.CAPTURING_PHASE );
			done();
		} );

		childDomElement.dispatchEvent( domEvent );
	} );

	describe( 'integration with UIElement', () => {
		let domRoot, domEvent, evtSpy, uiElement;

		function createUIElement( name ) {
			const element = new UIElement( viewDocument, name );

			element.render = function( domDocument ) {
				const root = this.toDomElement( domDocument );
				root.innerHTML = '<span>foo bar</span>';

				return root;
			};

			return element;
		}

		beforeEach( () => {
			domRoot = document.createElement( 'div' );
			const viewRoot = createViewRoot( viewDocument );
			view.attachDomRoot( domRoot );
			uiElement = createUIElement( 'p' );
			viewRoot._appendChild( uiElement );
			view.forceRender();

			domEvent = new MouseEvent( 'click', { bubbles: true } );
			evtSpy = sinon.spy();
			view.addObserver( ClickObserver );
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
			const testObserver = new ClickObserver( view );
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
