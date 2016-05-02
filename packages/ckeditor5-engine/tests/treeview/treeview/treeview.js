/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import TreeView from '/ckeditor5/engine/treeview/treeview.js';
import Observer from '/ckeditor5/engine/treeview/observer/observer.js';
import Renderer from '/ckeditor5/engine/treeview/renderer.js';
import Writer from '/ckeditor5/engine/treeview/writer.js';
import DomConverter from '/ckeditor5/engine/treeview/domconverter.js';

import count from '/ckeditor5/utils/count.js';

describe( 'TreeView', () => {
	let ObserverMock, ObserverMockGlobalCount, instantiated, enabled;

	beforeEach( () => {
		instantiated = 0;
		enabled = 0;

		ObserverMock = class extends Observer {
			constructor( treeView ) {
				super( treeView );

				this.enable = sinon.spy();
				this.disable = sinon.spy();
				this.observe = sinon.spy();
			}
		};

		ObserverMockGlobalCount = class extends Observer {
			constructor( treeView ) {
				super( treeView );
				instantiated++;

				this.observe = sinon.spy();
			}

			enable() {
				enabled++;
			}
		};
	} );

	describe( 'constructor', () => {
		it( 'should create TreeView with all properties', () => {
			const treeView = new TreeView();

			expect( count( treeView.domRoots ) ).to.equal( 0 );
			expect( count( treeView.viewRoots ) ).to.equal( 0 );
			expect( count( treeView._observers ) ).to.equal( 0 );
			expect( treeView ).to.have.property( 'renderer' ).that.is.instanceOf( Renderer );
			expect( treeView ).to.have.property( 'writer' ).that.is.instanceOf( Writer );
			expect( treeView ).to.have.property( 'domConverter' ).that.is.instanceOf( DomConverter );
		} );
	} );

	describe( 'createRoot', () => {
		it( 'should create root', () => {
			const domP = document.createElement( 'p' );
			const domDiv = document.createElement( 'div' );
			domDiv.setAttribute( 'id', 'editor' );
			domDiv.appendChild( domP );

			const treeView = new TreeView();
			const ret = treeView.createRoot( domDiv, 'editor' );

			expect( count( treeView.domRoots ) ).to.equal( 1 );
			expect( count( treeView.viewRoots ) ).to.equal( 1 );

			const domRoot = treeView.domRoots.get( 'editor' );
			const viewRoot = treeView.viewRoots.get( 'editor' );

			expect( ret ).to.equal( viewRoot );

			expect( domRoot ).to.equal( domDiv );
			expect( treeView.domConverter.getCorrespondingDom( viewRoot ) ).to.equal( domDiv );
			expect( viewRoot.name ).to.equal( 'div' );
			expect( viewRoot.getAttribute( 'id' ) ).to.equal( 'editor' );
			expect( treeView.renderer.markedChildren.has( viewRoot ) ).to.be.true;
		} );

		it( 'should call observe on each observer', () => {
			const treeView = new TreeView( document.createElement( 'div' ) );
			treeView.renderer.render = sinon.spy();

			const domDiv1 = document.createElement( 'div' );
			domDiv1.setAttribute( 'id', 'editor' );

			const domDiv2 = document.createElement( 'div' );
			domDiv2.setAttribute( 'id', 'editor' );

			const observerMock = treeView.addObserver( ObserverMock );
			const observerMockGlobalCount = treeView.addObserver( ObserverMockGlobalCount );

			treeView.createRoot( document.createElement( 'div' ), 'root1' );

			sinon.assert.calledOnce( observerMock.observe );
			sinon.assert.calledOnce( observerMockGlobalCount.observe );
		} );

		it( 'should create "main" root by default', () => {
			const domDiv = document.createElement( 'div' );

			const treeView = new TreeView();
			const ret = treeView.createRoot( domDiv );

			expect( count( treeView.domRoots ) ).to.equal( 1 );
			expect( count( treeView.viewRoots ) ).to.equal( 1 );

			const domRoot = treeView.domRoots.get( 'main' );
			const viewRoot = treeView.viewRoots.get( 'main' );

			expect( ret ).to.equal( viewRoot );

			expect( domRoot ).to.equal( domDiv );
		} );
	} );

	describe( 'getRoot', () => {
		it( 'should return "main" root', () => {
			const treeView = new TreeView();
			treeView.createRoot( document.createElement( 'div' ) );

			expect( count( treeView.viewRoots ) ).to.equal( 1 );

			expect( treeView.getRoot() ).to.equal( treeView.viewRoots.get( 'main' ) );
		} );

		it( 'should return named root', () => {
			const treeView = new TreeView();
			treeView.createRoot( document.createElement( 'h1' ), 'header' );

			expect( count( treeView.viewRoots ) ).to.equal( 1 );

			expect( treeView.getRoot( 'header' ) ).to.equal( treeView.viewRoots.get( 'header' ) );
		} );
	} );

	describe( 'addObserver', () => {
		let treeView;

		beforeEach( () => {
			treeView = new TreeView( document.createElement( 'div' ) );
			treeView.renderer.render = sinon.spy();
		} );

		it( 'should be instantiated and enabled on adding', () => {
			const observerMock = treeView.addObserver( ObserverMock );

			expect( treeView._observers.size ).to.equal( 1 );

			expect( observerMock ).to.have.property( 'treeView', treeView );
			sinon.assert.calledOnce( observerMock.enable );
		} );

		it( 'should instantiate one observer only once', () => {
			treeView.addObserver( ObserverMockGlobalCount );
			treeView.addObserver( ObserverMockGlobalCount );

			expect( treeView._observers.size ).to.equal( 1 );
			expect( instantiated ).to.equal( 1 );
			expect( enabled ).to.equal( 1 );

			treeView.addObserver( ObserverMock );
			expect( treeView._observers.size ).to.equal( 2 );
		} );

		it( 'should instantiate child class of already registered observer', () => {
			class ObserverMock extends Observer {
				enable() {}
			}
			class ChildObserverMock extends ObserverMock {
				enable() {}
			}

			treeView.addObserver( ObserverMock );
			treeView.addObserver( ChildObserverMock );

			expect( treeView._observers.size ).to.equal( 2 );
		} );

		it( 'should be disabled and re-enabled on render', () => {
			const observerMock = treeView.addObserver( ObserverMock );
			treeView.render();

			sinon.assert.calledOnce( observerMock.disable );
			sinon.assert.calledOnce( treeView.renderer.render );
			sinon.assert.calledTwice( observerMock.enable );
		} );

		it( 'should call observe on each root', () => {
			treeView.createRoot( document.createElement( 'div' ), 'root1' );
			treeView.createRoot( document.createElement( 'div' ), 'root2' );

			const observerMock = treeView.addObserver( ObserverMock );

			sinon.assert.calledTwice( observerMock.observe );
		} );
	} );

	describe( 'getObserver', () => {
		it( 'should return observer it it is added', () => {
			const treeView = new TreeView();

			const addedObserverMock = treeView.addObserver( ObserverMock );
			const getObserverMock = treeView.getObserver( ObserverMock );

			expect( getObserverMock ).to.be.instanceof( ObserverMock );
			expect( getObserverMock ).to.equal( addedObserverMock );
		} );

		it( 'should return undefined if observer is not added', () => {
			const treeView = new TreeView();
			const getObserverMock = treeView.getObserver( ObserverMock );

			expect( getObserverMock ).to.be.undefined();
		} );
	} );
} );
