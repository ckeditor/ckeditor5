/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';
import View from '../src/view.js';
import Template from '../src/template.js';

import Collection from '@ckeditor/ckeditor5-utils/src/collection.js';
import ViewCollection from '../src/viewcollection.js';
import normalizeHtml from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml.js';
import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

let TestView, view, childA, childB;

describe( 'View', () => {
	testUtils.createSinonSandbox();

	afterEach( () => {
		if ( view.element ) {
			view.element.remove();
		}

		view.destroy();
	} );

	describe( 'constructor()', () => {
		beforeEach( () => {
			setTestViewClass();
			setTestViewInstance();
		} );

		it( 'defines basic view properties', () => {
			view = new View();

			expect( view.t ).to.be.undefined;
			expect( view.locale ).to.be.undefined;
			expect( view.isRendered ).to.be.false;
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

		it( 'accepts initial views', () => {
			const viewA = new View();
			const viewB = new View();

			const collection = view.createCollection( [ viewA, viewB ] );

			expect( collection ).to.have.length( 2 );
			expect( collection.get( 0 ) ).to.equal( viewA );
			expect( collection.get( 1 ) ).to.equal( viewB );
		} );
	} );

	describe( 'registerChild()', () => {
		beforeEach( () => {
			setTestViewClass();
			setTestViewInstance();
		} );

		it( 'should add a single view to #_unboundChildren', () => {
			expect( view._unboundChildren ).to.have.length( 0 );

			const child = new View();

			view.registerChild( child );
			expect( view._unboundChildren ).to.have.length( 1 );
			expect( view._unboundChildren.get( 0 ) ).to.equal( child );
		} );

		it( 'should support iterables', () => {
			expect( view._unboundChildren ).to.have.length( 0 );

			view.registerChild( [ new View(), new View(), new View() ] );
			expect( view._unboundChildren ).to.have.length( 3 );
		} );
	} );

	describe( 'deregisterChild()', () => {
		beforeEach( () => {
			setTestViewClass();
			setTestViewInstance();
		} );

		it( 'should remove a single view from #_unboundChildren', () => {
			const child1 = new View();
			const child2 = new View();

			view.registerChild( child1 );
			view.registerChild( child2 );
			expect( view._unboundChildren ).to.have.length( 2 );

			view.deregisterChild( child2 );
			expect( view._unboundChildren ).to.have.length( 1 );
			expect( view._unboundChildren.get( 0 ) ).to.equal( child1 );
		} );

		it( 'should support iterables', () => {
			const child1 = new View();
			const child2 = new View();
			const child3 = new View();

			view.registerChild( [ child1, child2, child3 ] );
			expect( view._unboundChildren ).to.have.length( 3 );

			view.deregisterChild( [ child2, child3 ] );
			expect( view._unboundChildren ).to.have.length( 1 );
			expect( view._unboundChildren.get( 0 ) ).to.equal( child1 );
		} );
	} );

	describe( 'setTemplate()', () => {
		it( 'sets the template', () => {
			const view = new View();
			const bind = view.bindTemplate;

			view.set( 'foo', 'bar' );

			view.setTemplate( {
				tag: 'div',
				attributes: {
					class: [
						bind.to( 'foo' )
					]
				}
			} );

			view.render();

			expect( normalizeHtml( view.element.outerHTML ) ).to.equal( '<div class="bar"></div>' );
		} );
	} );

	describe( 'extendTemplate()', () => {
		it( 'extends the template', () => {
			const view = new View();
			const bind = view.bindTemplate;

			view.set( 'foo', 'bar' );

			view.setTemplate( {
				tag: 'div'
			} );

			view.extendTemplate( {
				attributes: {
					class: [
						bind.to( 'foo' )
					]
				}
			} );

			view.render();

			expect( normalizeHtml( view.element.outerHTML ) ).to.equal( '<div class="bar"></div>' );
		} );
	} );

	describe( 'render()', () => {
		it( 'is decorated', done => {
			const view = new View();

			view.on( 'render', () => {
				expect( view.isRendered ).to.be.true;
				done();
			} );

			view.render();
		} );

		it( 'should throw if already rendered', () => {
			const view = new View();

			view.render();

			try {
				view.render();
				throw new Error( 'This should not be executed.' );
			} catch ( err ) {
				// TODO
				assertCKEditorError( err, 'ui-view-render-already-rendered', view );
			}
		} );

		it( 'should set view#isRendered', () => {
			const view = new View();

			view.setTemplate( {
				tag: 'div'
			} );

			expect( view.isRendered ).to.be.false;

			view.render();
			expect( view.isRendered ).to.be.true;
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

			const view = new CustomView();

			expect( view.element ).to.be.an.instanceof( HTMLElement );
		} );

		it( 'is null when there is no template', () => {
			const view = new View();

			view.render();

			expect( view.element ).to.be.null;
		} );

		it( 'registers child views found in the template', () => {
			const view = new View();
			const viewA = new View();
			const viewB = new View();
			const viewC = new View();

			viewA.setTemplate( { tag: 'a' } );
			viewB.setTemplate( { tag: 'b' } );
			viewC.setTemplate( { tag: 'c' } );

			view.setTemplate( {
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

			view.render();

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
				view.destroy();
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

			view.registerChild( [ new View(), new View() ] );
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
			const view = new View();

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
				this.setTemplate( templateDef );
			}
		}
	};
}

function setTestViewInstance() {
	view = new TestView();

	if ( view.template ) {
		view.render();

		document.body.appendChild( view.element );
	}
}

function createViewWithChildren() {
	class ChildView extends View {
		constructor() {
			super();

			this.setTemplate( {
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
