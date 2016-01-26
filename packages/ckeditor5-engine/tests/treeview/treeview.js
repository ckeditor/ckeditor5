/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: treeview */

'use strict';

import TreeView from '/ckeditor5/core/treeview/treeview.js';
import Observer from '/ckeditor5/core/treeview/observer/observer.js';
import Renderer from '/ckeditor5/core/treeview/renderer.js';
import Converter from '/ckeditor5/core/treeview/converter.js';

describe( 'TreeView', () => {
	describe( 'constructor', () => {
		it( 'should create TreeView with all properties', () => {
			const domP = document.createElement( 'p' );
			const domDiv = document.createElement( 'div' );
			domDiv.setAttribute( 'id', 'editor' );
			domDiv.appendChild( domP );

			const treeView = new TreeView( domDiv );

			expect( treeView ).to.have.property( 'domRoot' ).that.equals( domDiv );
			expect( treeView ).to.have.property( 'observers' ).that.is.instanceOf( Set );
			expect( treeView ).to.have.property( 'renderer' ).that.is.instanceOf( Renderer );
			expect( treeView ).to.have.property( 'converter' ).that.is.instanceOf( Converter );
			expect( treeView ).to.have.property( 'viewRoot' );

			expect( treeView.converter.getCorrespondingDom( treeView.viewRoot ) ).to.equal( domDiv );
			expect( treeView.viewRoot.name ).to.equal( 'div' );
			expect( treeView.viewRoot.getAttribute( 'id' ) ).to.equal( 'editor' );
			expect( treeView.renderer.markedChildren.has( treeView.viewRoot ) ).to.be.true;
		} );
	} );

	describe( 'observer', () => {
		let observerMock, treeView;

		beforeEach( () => {
			observerMock = new Observer();
			observerMock.attach = sinon.spy();
			observerMock.detach = sinon.spy();
			observerMock.init = sinon.spy();

			treeView = new TreeView( document.createElement( 'div' ) );
			treeView.renderer.render = sinon.spy();
		} );

		it( 'should be inited and attached on adding', () => {
			treeView.addObserver( observerMock );

			expect( treeView.observers.has( observerMock ) ).to.be.true;
			sinon.assert.calledOnce( observerMock.init );
			sinon.assert.calledWith( observerMock.init, treeView );
			sinon.assert.calledOnce( observerMock.attach );
		} );

		it( 'should be detached and reattached on render', () => {
			treeView.addObserver( observerMock );
			treeView.render();

			expect( treeView.observers.has( observerMock ) ).to.be.true;
			sinon.assert.calledOnce( observerMock.detach );
			sinon.assert.calledOnce( treeView.renderer.render );
			sinon.assert.calledTwice( observerMock.attach );
		} );
	} );
} );
