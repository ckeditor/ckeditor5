/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, HTMLElement */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import View from '../src/view';
import Template from '../src/template';
import CKEditorError from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import ViewCollection from '../src/viewcollection';

let TestView, view, childA, childB;

testUtils.createSinonSandbox();

describe( 'View', () => {
	describe( 'constructor()', () => {
		beforeEach( () => {
			setTestViewClass();
			setTestViewInstance();
		} );

		it( 'defines basic view properties', () => {
			view = new View();

			expect( view.t ).to.be.undefined;
			expect( view.locale ).to.be.undefined;
			expect( view.ready ).to.be.false;
			expect( view.template ).to.be.undefined;
			expect( view._viewCollections ).to.be.instanceOf( Collection );
			expect( view._unboundChildren ).to.be.instanceOf( ViewCollection );
		} );

		it( 'defines the locale property and the "t" function', () => {
			const locale = { t() {} };

			view = new View( locale );

			expect( view.locale ).to.equal( locale );
			expect( view.t ).to.equal( locale.t );
		} );

		describe( '_viewCollections', () => {
			it( 'manages #locale property', () => {
				const locale = {
					t() {}
				};

				const view = new View( locale );
				const collection = new ViewCollection();

				expect( view.locale ).to.equal( locale );
				expect( collection.locale ).to.be.undefined;

				view._viewCollections.add( collection );
				expect( collection.locale ).to.equal( view.locale );
			} );
		} );
	} );

	describe( 'createCollection()', () => {
		beforeEach( () => {
			setTestViewClass();
			setTestViewInstance();
		} );

		it( 'returns an instance of view collection', () => {
			expect( view.createCollection() ).to.be.instanceOf( ViewCollection );
		} );

		it( 'adds a new collection to the #_viewCollections', () => {
			expect( view._viewCollections ).to.have.length( 1 );

			const collection = view.createCollection();

			expect( view._viewCollections ).to.have.length( 2 );
			expect( view._viewCollections.get( 1 ) ).to.equal( collection );
		} );
	} );

	describe( 'addChildren()', () => {
		beforeEach( () => {
			setTestViewClass();
			setTestViewInstance();
		} );

		it( 'should add a single view to #_unboundChildren', () => {
			expect( view._unboundChildren ).to.have.length( 0 );

			const child = {};

			view.addChildren( child );
			expect( view._unboundChildren ).to.have.length( 1 );
			expect( view._unboundChildren.get( 0 ) ).to.equal( child );
		} );

		it( 'should support iterables', () => {
			expect( view._unboundChildren ).to.have.length( 0 );

			view.addChildren( [ {}, {}, {} ] );
			expect( view._unboundChildren ).to.have.length( 3 );
		} );
	} );

	describe( 'init()', () => {
		beforeEach( createViewWithChildren );

		it( 'should throw if already initialized', () => {
			view.init();

			try {
				view.init();
				throw new Error( 'This should not be executed.' );
			} catch ( err ) {
				expect( err ).to.be.instanceof( CKEditorError );
				expect( err.message ).to.match( /ui-view-init-re/ );
			}
		} );

		it( 'should set view#ready', () => {
			expect( view.ready ).to.be.false;

			view.init();
			expect( view.ready ).to.be.true;
		} );

		it( 'calls init() on all view#_viewCollections', () => {
			const collectionA = view.createCollection();
			const collectionB = view.createCollection();

			const spyA = testUtils.sinon.spy( collectionA, 'init' );
			const spyB = testUtils.sinon.spy( collectionB, 'init' );

			view.init();
			sinon.assert.calledOnce( spyA );
			sinon.assert.calledOnce( spyB );
			sinon.assert.callOrder( spyA, spyB );
		} );
	} );

	describe( 'bind', () => {
		beforeEach( () => {
			setTestViewClass();
			setTestViewInstance();
		} );

		it( 'returns a shorthand for Template binding', () => {
			expect( view.bindTemplate.to ).to.be.a( 'function' );
			expect( view.bindTemplate.if ).to.be.a( 'function' );

			const binding = view.bindTemplate.to( 'a' );

			expect( binding.observable ).to.equal( view );
			expect( binding.emitter ).to.equal( view );
		} );
	} );

	describe( 'element', () => {
		beforeEach( createViewInstanceWithTemplate );

		it( 'invokes out of #template', () => {
			setTestViewInstance();

			expect( view.element ).to.be.an.instanceof( HTMLElement );
			expect( view.element.nodeName ).to.equal( 'A' );
		} );

		it( 'can be explicitly declared', () => {
			class CustomView extends View {
				constructor() {
					super();

					this.element = document.createElement( 'span' );
				}
			}

			view = new CustomView();

			expect( view.element ).to.be.an.instanceof( HTMLElement );
		} );

		it( 'is null when there is no template', () => {
			expect( new View().element ).to.be.null;
		} );

		it( 'registers child views found in the template', () => {
			const view = new View();
			const viewA = new View();
			const viewB = new View();
			const viewC = new View();

			viewA.template = new Template( { tag: 'a' } );
			viewB.template = new Template( { tag: 'b' } );
			viewC.template = new Template( { tag: 'c' } );

			view.template = new Template( {
				tag: 'div',
				children: [
					viewA,
					viewB,
					{
						tag: 'p',
						children: [
							viewC
						]
					},
					{
						text: 'foo'
					}
				]
			} );

			expect( view._unboundChildren ).to.have.length( 0 );

			// Render the view.
			view.element;

			expect( view._unboundChildren ).to.have.length( 3 );
			expect( view._unboundChildren.get( 0 ) ).to.equal( viewA );
			expect( view._unboundChildren.get( 1 ) ).to.equal( viewB );
			expect( view._unboundChildren.get( 2 ) ).to.equal( viewC );
		} );
	} );

	describe( 'destroy()', () => {
		beforeEach( createViewWithChildren );

		it( 'can be called multiple times', () => {
			expect( () => {
				view.destroy();
			} ).to.not.throw();
		} );

		it( 'should not touch the basic properties', () => {
			view.destroy();

			expect( view.element ).to.be.an.instanceof( HTMLElement );
			expect( view.template ).to.be.an.instanceof( Template );
			expect( view.locale ).to.be.an( 'object' );
			expect( view.locale.t ).to.be.a( 'function' );

			expect( view._viewCollections ).to.be.instanceOf( Collection );
			expect( view._unboundChildren ).to.be.instanceOf( ViewCollection );
		} );

		it( 'should not clear the #_unboundChildren', () => {
			const cached = view._unboundChildren;

			view.addChildren( [ new View(), new View() ] );
			expect( cached ).to.have.length( 4 );

			view.destroy();
			expect( cached ).to.have.length( 4 );
		} );

		it( 'should not clear the #_viewCollections', () => {
			const cached = view._viewCollections;

			expect( cached ).to.have.length( 1 );

			view.destroy();
			expect( cached ).to.have.length( 1 );
		} );

		it( 'leaves the #element in DOM', () => {
			const elRef = view.element;
			const parentEl = document.createElement( 'div' );

			parentEl.appendChild( view.element );

			view.destroy();
			expect( elRef.parentNode ).to.equal( parentEl );
		} );

		it( 'calls destroy() on all view#_viewCollections', () => {
			const collectionA = view.createCollection();
			const collectionB = view.createCollection();

			const spyA = testUtils.sinon.spy( collectionA, 'destroy' );
			const spyB = testUtils.sinon.spy( collectionB, 'destroy' );

			view.destroy();
			sinon.assert.calledOnce( spyA );
			sinon.assert.calledOnce( spyB );
			sinon.assert.callOrder( spyA, spyB );
		} );

		it( 'destroy a template–less view', () => {
			view = new View();

			expect( () => {
				view.destroy();
			} ).to.not.throw();
		} );
	} );
} );

function createViewInstanceWithTemplate() {
	setTestViewClass( { tag: 'a' } );
	setTestViewInstance();
}

function setTestViewClass( templateDef ) {
	TestView = class V extends View {
		constructor() {
			super();

			this.locale = { t() {} };

			if ( templateDef ) {
				this.template = new Template( templateDef );
			}
		}
	};
}

function setTestViewInstance() {
	view = new TestView();

	if ( view.template ) {
		document.body.appendChild( view.element );
	}
}

function createViewWithChildren() {
	class ChildView extends View {
		constructor() {
			super();

			this.template = new Template( {
				tag: 'span'
			} );
		}
	}

	childA = new ChildView();
	childB = new ChildView();

	setTestViewClass( {
		tag: 'p',
		children: [ childA, childB ]
	} );

	setTestViewInstance();
}
