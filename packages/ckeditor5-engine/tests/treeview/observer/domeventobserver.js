/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import DomEventObserver from '/ckeditor5/core/treeview/observer/domeventobserver.js';
import Observer from '/ckeditor5/core/treeview/observer/observer.js';
import TreeView from '/ckeditor5/core/treeview/treeview.js';

class ClickObserver extends DomEventObserver {
	constructor( treeView ) {
		super( treeView );

		this.domEventType = 'click';
	}

	onDomEvent( domEvt ) {
		this.fire( 'click', 'foo', domEvt );
	}
}

class MultiObserver extends DomEventObserver {
	constructor( treeView ) {
		super( treeView );

		this.domEventType = [ 'evt1', 'evt2' ];
	}

	onDomEvent( domEvt ) {
		this.fire( domEvt.type );
	}
}

describe( 'DomEventObserver', () => {
	let treeView;

	beforeEach( () => {
		treeView = new TreeView();
	} );

	describe( 'constructor', () => {
		it( 'should create Observer with properties', () => {
			const observer = new DomEventObserver( treeView );

			expect( observer ).to.be.an.instanceof( Observer );
		} );
	} );

	it( 'should add event listener', () => {
		const domElement = document.createElement( 'p' );
		const domEvent = new MouseEvent( 'click' );
		const evtSpy = sinon.spy();

		treeView.createRoot( domElement, 'root' );
		treeView.addObserver( ClickObserver );
		treeView.on( 'click', evtSpy );

		domElement.dispatchEvent( domEvent );

		expect( evtSpy.calledOnce ).to.be.true;
		expect( evtSpy.args[ 0 ][ 1 ] ).to.equal( 'foo' );
		expect( evtSpy.args[ 0 ][ 2 ] ).to.equal( domEvent );
	} );

	it( 'should add multiple event listeners', () => {
		const domElement = document.createElement( 'p' );
		const domEvent1 = new MouseEvent( 'evt1' );
		const domEvent2 = new MouseEvent( 'evt2' );
		const evtSpy1 = sinon.spy();
		const evtSpy2 = sinon.spy();

		treeView.createRoot( domElement, 'root' );
		treeView.addObserver( MultiObserver );
		treeView.on( 'evt1', evtSpy1 );
		treeView.on( 'evt2', evtSpy2 );

		domElement.dispatchEvent( domEvent1 );
		expect( evtSpy1.calledOnce ).to.be.true;

		domElement.dispatchEvent( domEvent2 );
		expect( evtSpy2.calledOnce ).to.be.true;
	} );

	it( 'should not fire event if observer is disabled', () => {
		const domElement = document.createElement( 'p' );
		const domEvent = new MouseEvent( 'click' );
		const evtSpy = sinon.spy();

		treeView.createRoot( domElement, 'root' );
		treeView.addObserver( ClickObserver );
		treeView.on( 'click', evtSpy );

		const testObserver = Array.from( treeView._observers )[ 0 ];
		testObserver.disable();

		domElement.dispatchEvent( domEvent );

		expect( evtSpy.called ).to.be.false;
	} );

	it( 'should fire event if observer is disabled and re-enabled', () => {
		const domElement = document.createElement( 'p' );
		const domEvent = new MouseEvent( 'click' );
		const treeView = new TreeView();
		const evtSpy = sinon.spy();

		treeView.createRoot( domElement, 'root' );
		treeView.addObserver( ClickObserver );
		treeView.on( 'click', evtSpy );

		const testObserver = Array.from( treeView._observers )[ 0 ];

		testObserver.disable();

		domElement.dispatchEvent( domEvent );

		expect( evtSpy.called ).to.be.false;

		testObserver.enable();

		domElement.dispatchEvent( domEvent );

		expect( evtSpy.calledOnce ).to.be.true;
	} );

	describe( 'fire', () => {
		it( 'should do nothing if observer is disabled', () => {
			const testObserver = new ClickObserver( treeView );
			const fireSpy = sinon.spy( treeView, 'fire' );

			testObserver.disable();

			testObserver.fire( 'click' );

			expect( fireSpy.called ).to.be.false;

			testObserver.enable();

			testObserver.fire( 'click' );

			expect( fireSpy.calledOnce ).to.be.true;
		} );
	} );
} );
