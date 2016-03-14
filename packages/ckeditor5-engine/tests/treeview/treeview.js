/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import TreeView from '/ckeditor5/core/treeview/treeview.js';
import Observer from '/ckeditor5/core/treeview/observer/observer.js';
import Renderer from '/ckeditor5/core/treeview/renderer.js';
import Writer from '/ckeditor5/core/treeview/writer.js';
import DomConverter from '/ckeditor5/core/treeview/domconverter.js';

import utils from '/ckeditor5/utils/utils.js';

const count = utils.count;

describe( 'TreeView', () => {
	describe( 'constructor', () => {
		it( 'should create TreeView with all properties', () => {
			const treeView = new TreeView();

			expect( count( treeView.domRoots ) ).to.equal( 0 );
			expect( count( treeView.viewRoots ) ).to.equal( 0 );
			expect( count( treeView.observers ) ).to.equal( 0 );
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
			treeView.createRoot( domDiv, 'editor' );

			expect( count( treeView.domRoots ) ).to.equal( 1 );
			expect( count( treeView.viewRoots ) ).to.equal( 1 );

			const domRoot = treeView.domRoots.get( 'editor' );
			const viewRoot = treeView.viewRoots.get( 'editor' );

			expect( domRoot ).to.equal( domDiv );
			expect( treeView.domConverter.getCorrespondingDom( viewRoot ) ).to.equal( domDiv );
			expect( viewRoot.name ).to.equal( 'div' );
			expect( viewRoot.getAttribute( 'id' ) ).to.equal( 'editor' );
			expect( treeView.renderer.markedChildren.has( viewRoot ) ).to.be.true;
		} );
	} );

	describe( 'observer', () => {
		let observerMock, treeView;

		beforeEach( () => {
			observerMock = new Observer();
			observerMock.enable = sinon.spy();
			observerMock.disable = sinon.spy();
			observerMock.init = sinon.spy();

			treeView = new TreeView( document.createElement( 'div' ) );
			treeView.renderer.render = sinon.spy();
		} );

		it( 'should be inited and enabled on adding', () => {
			treeView.addObserver( observerMock );

			expect( treeView.observers.has( observerMock ) ).to.be.true;
			sinon.assert.calledOnce( observerMock.init );
			sinon.assert.calledWith( observerMock.init, treeView );
			sinon.assert.calledOnce( observerMock.enable );
		} );

		it( 'should be disabled and re-enabled on render', () => {
			treeView.addObserver( observerMock );
			treeView.render();

			expect( treeView.observers.has( observerMock ) ).to.be.true;
			sinon.assert.calledOnce( observerMock.disable );
			sinon.assert.calledOnce( treeView.renderer.render );
			sinon.assert.calledTwice( observerMock.enable );
		} );
	} );
} );
