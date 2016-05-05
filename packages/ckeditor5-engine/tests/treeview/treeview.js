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
	} );

	describe( 'addObserver', () => {
		let ObserverMock, treeView;

		beforeEach( () => {
			ObserverMock = class extends Observer {
				constructor( treeView ) {
					super( treeView );

					this.enable = sinon.spy();
					this.disable = sinon.spy();
				}
			};

			treeView = new TreeView( document.createElement( 'div' ) );
			treeView.renderer.render = sinon.spy();
		} );

		it( 'should be instantiated and enabled on adding', () => {
			treeView.addObserver( ObserverMock );

			expect( treeView._observers.size ).to.equal( 1 );

			const observerMock = Array.from( treeView._observers )[ 0 ];

			expect( observerMock ).to.have.property( 'treeView', treeView );
			sinon.assert.calledOnce( observerMock.enable );
		} );

		it( 'should instantiate one observer only once', () => {
			let instantiated = 0;
			let enabled = 0;

			class ObserverMock2 extends Observer {
				constructor( treeView ) {
					super( treeView );
					instantiated++;
				}

				enable() {
					enabled++;
				}
			}

			treeView.addObserver( ObserverMock2 );
			treeView.addObserver( ObserverMock2 );

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
			treeView.addObserver( ObserverMock );
			treeView.render();

			const observerMock = Array.from( treeView._observers )[ 0 ];

			sinon.assert.calledOnce( observerMock.disable );
			sinon.assert.calledOnce( treeView.renderer.render );
			sinon.assert.calledTwice( observerMock.enable );
		} );
	} );
} );
