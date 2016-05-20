/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: view, browser-only */

'use strict';

import Document from '/ckeditor5/engine/view/document.js';
import Observer from '/ckeditor5/engine/view/observer/observer.js';
import Renderer from '/ckeditor5/engine/view/renderer.js';
import Writer from '/ckeditor5/engine/view/writer.js';
import DomConverter from '/ckeditor5/engine/view/domconverter.js';

import count from '/ckeditor5/utils/count.js';

describe( 'Document', () => {
	let ObserverMock, ObserverMockGlobalCount, instantiated, enabled;

	beforeEach( () => {
		instantiated = 0;
		enabled = 0;

		ObserverMock = class extends Observer {
			constructor( viewDocument ) {
				super( viewDocument );

				this.enable = sinon.spy();
				this.disable = sinon.spy();
				this.observe = sinon.spy();
			}
		};

		ObserverMockGlobalCount = class extends Observer {
			constructor( viewDocument ) {
				super( viewDocument );
				instantiated++;

				this.observe = sinon.spy();
			}

			enable() {
				enabled++;
			}
		};
	} );

	describe( 'constructor', () => {
		it( 'should create Document with all properties', () => {
			const viewDocument = new Document();

			expect( count( viewDocument.domRoots ) ).to.equal( 0 );
			expect( count( viewDocument.viewRoots ) ).to.equal( 0 );
			expect( count( viewDocument._observers ) ).to.equal( 0 );
			expect( viewDocument ).to.have.property( 'renderer' ).that.is.instanceOf( Renderer );
			expect( viewDocument ).to.have.property( 'writer' ).that.is.instanceOf( Writer );
			expect( viewDocument ).to.have.property( 'domConverter' ).that.is.instanceOf( DomConverter );
		} );
	} );

	describe( 'createRoot', () => {
		it( 'should create root', () => {
			const domP = document.createElement( 'p' );
			const domDiv = document.createElement( 'div' );
			domDiv.setAttribute( 'id', 'editor' );
			domDiv.appendChild( domP );

			const viewDocument = new Document();
			const ret = viewDocument.createRoot( domDiv, 'editor' );

			expect( count( viewDocument.domRoots ) ).to.equal( 1 );
			expect( count( viewDocument.viewRoots ) ).to.equal( 1 );

			const domRoot = viewDocument.domRoots.get( 'editor' );
			const viewRoot = viewDocument.viewRoots.get( 'editor' );

			expect( ret ).to.equal( viewRoot );

			expect( domRoot ).to.equal( domDiv );
			expect( viewDocument.domConverter.getCorrespondingDom( viewRoot ) ).to.equal( domDiv );
			expect( viewRoot.name ).to.equal( 'div' );
			expect( viewRoot.getAttribute( 'id' ) ).to.equal( 'editor' );
			expect( viewDocument.renderer.markedChildren.has( viewRoot ) ).to.be.true;
		} );

		it( 'should call observe on each observer', () => {
			const viewDocument = new Document( document.createElement( 'div' ) );
			viewDocument.renderer.render = sinon.spy();

			const domDiv1 = document.createElement( 'div' );
			domDiv1.setAttribute( 'id', 'editor' );

			const domDiv2 = document.createElement( 'div' );
			domDiv2.setAttribute( 'id', 'editor' );

			const observerMock = viewDocument.addObserver( ObserverMock );
			const observerMockGlobalCount = viewDocument.addObserver( ObserverMockGlobalCount );

			viewDocument.createRoot( document.createElement( 'div' ), 'root1' );

			sinon.assert.calledOnce( observerMock.observe );
			sinon.assert.calledOnce( observerMockGlobalCount.observe );
		} );

		it( 'should create "main" root by default', () => {
			const domDiv = document.createElement( 'div' );

			const viewDocument = new Document();
			const ret = viewDocument.createRoot( domDiv );

			expect( count( viewDocument.domRoots ) ).to.equal( 1 );
			expect( count( viewDocument.viewRoots ) ).to.equal( 1 );

			const domRoot = viewDocument.domRoots.get( 'main' );
			const viewRoot = viewDocument.viewRoots.get( 'main' );

			expect( ret ).to.equal( viewRoot );

			expect( domRoot ).to.equal( domDiv );
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return "main" root', () => {
			const viewDocument = new Document();
			viewDocument.createRoot( document.createElement( 'div' ) );

			expect( count( viewDocument.viewRoots ) ).to.equal( 1 );

			expect( viewDocument.getRoot() ).to.equal( viewDocument.viewRoots.get( 'main' ) );
		} );

		it( 'should return named root', () => {
			const viewDocument = new Document();
			viewDocument.createRoot( document.createElement( 'h1' ), 'header' );

			expect( count( viewDocument.viewRoots ) ).to.equal( 1 );

			expect( viewDocument.getRoot( 'header' ) ).to.equal( viewDocument.viewRoots.get( 'header' ) );
		} );
	} );

	describe( 'addObserver', () => {
		let viewDocument;

		beforeEach( () => {
			viewDocument = new Document( document.createElement( 'div' ) );
			viewDocument.renderer.render = sinon.spy();
		} );

		it( 'should be instantiated and enabled on adding', () => {
			const observerMock = viewDocument.addObserver( ObserverMock );

			expect( viewDocument._observers.size ).to.equal( 1 );

			expect( observerMock ).to.have.property( 'document', viewDocument );
			sinon.assert.calledOnce( observerMock.enable );
		} );

		it( 'should return observer instance ever time addObserver is called', () => {
			const observerMock1 = viewDocument.addObserver( ObserverMock );
			const observerMock2 = viewDocument.addObserver( ObserverMock );

			expect( observerMock1 ).to.be.instanceof( ObserverMock );
			expect( observerMock2 ).to.be.instanceof( ObserverMock );
			expect( observerMock1 ).to.equals( observerMock2 );
		} );

		it( 'should instantiate one observer only once', () => {
			viewDocument.addObserver( ObserverMockGlobalCount );
			viewDocument.addObserver( ObserverMockGlobalCount );

			expect( viewDocument._observers.size ).to.equal( 1 );
			expect( instantiated ).to.equal( 1 );
			expect( enabled ).to.equal( 1 );

			viewDocument.addObserver( ObserverMock );
			expect( viewDocument._observers.size ).to.equal( 2 );
		} );

		it( 'should instantiate child class of already registered observer', () => {
			class ObserverMock extends Observer {
				enable() {}
			}
			class ChildObserverMock extends ObserverMock {
				enable() {}
			}

			viewDocument.addObserver( ObserverMock );
			viewDocument.addObserver( ChildObserverMock );

			expect( viewDocument._observers.size ).to.equal( 2 );
		} );

		it( 'should be disabled and re-enabled on render', () => {
			const observerMock = viewDocument.addObserver( ObserverMock );
			viewDocument.render();

			sinon.assert.calledOnce( observerMock.disable );
			sinon.assert.calledOnce( viewDocument.renderer.render );
			sinon.assert.calledTwice( observerMock.enable );
		} );

		it( 'should call observe on each root', () => {
			viewDocument.createRoot( document.createElement( 'div' ), 'root1' );
			viewDocument.createRoot( document.createElement( 'div' ), 'root2' );

			const observerMock = viewDocument.addObserver( ObserverMock );

			sinon.assert.calledTwice( observerMock.observe );
		} );
	} );

	describe( 'getObserver', () => {
		it( 'should return observer it it is added', () => {
			const viewDocument = new Document();

			const addedObserverMock = viewDocument.addObserver( ObserverMock );
			const getObserverMock = viewDocument.getObserver( ObserverMock );

			expect( getObserverMock ).to.be.instanceof( ObserverMock );
			expect( getObserverMock ).to.equal( addedObserverMock );
		} );

		it( 'should return undefined if observer is not added', () => {
			const viewDocument = new Document();
			const getObserverMock = viewDocument.getObserver( ObserverMock );

			expect( getObserverMock ).to.be.undefined();
		} );
	} );
} );
