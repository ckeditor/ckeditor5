/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { View } from '../src/view.js';
import { Template } from '../src/template.js';

import { Collection } from '@ckeditor/ckeditor5-utils';
import { ViewCollection } from '../src/viewcollection.js';
import { normalizeHtml } from '@ckeditor/ckeditor5-utils/tests/_utils/normalizehtml.js';
import { assertCKEditorError } from '@ckeditor/ckeditor5-utils/tests/_utils/utils.js';

let TestView, view, childA, childB;

describe( 'View', () => {
	afterEach( () => {
		vi.restoreAllMocks();
	} );

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

			expect( view.t ).toBeUndefined();
			expect( view.locale ).toBeUndefined();
			expect( view.isRendered ).toBe( false );
			expect( view.template ).toBeUndefined();
			expect( view._viewCollections ).toBeInstanceOf( Collection );
			expect( view._unboundChildren ).toBeInstanceOf( ViewCollection );
		} );

		it( 'defines the locale property and the "t" function', () => {
			const locale = { t() {} };

			view = new View( locale );

			expect( view.locale ).toBe( locale );
			expect( view.t ).toBe( locale.t );
		} );

		describe( '_viewCollections', () => {
			it( 'manages #locale property', () => {
				const locale = {
					t() {}
				};

				const view = new View( locale );
				const collection = new ViewCollection();

				expect( view.locale ).toBe( locale );
				expect( collection.locale ).toBeUndefined();

				view._viewCollections.add( collection );
				expect( collection.locale ).toBe( view.locale );
			} );
		} );
	} );

	describe( 'createCollection()', () => {
		beforeEach( () => {
			setTestViewClass();
			setTestViewInstance();
		} );

		it( 'returns an instance of view collection', () => {
			expect( view.createCollection() ).toBeInstanceOf( ViewCollection );
		} );

		it( 'adds a new collection to the #_viewCollections', () => {
			expect( view._viewCollections ).toHaveLength( 1 );

			const collection = view.createCollection();

			expect( view._viewCollections ).toHaveLength( 2 );
			expect( view._viewCollections.get( 1 ) ).toBe( collection );
		} );

		it( 'accepts initial views', () => {
			const viewA = new View();
			const viewB = new View();

			const collection = view.createCollection( [ viewA, viewB ] );

			expect( collection ).toHaveLength( 2 );
			expect( collection.get( 0 ) ).toBe( viewA );
			expect( collection.get( 1 ) ).toBe( viewB );
		} );
	} );

	describe( 'registerChild()', () => {
		beforeEach( () => {
			setTestViewClass();
			setTestViewInstance();
		} );

		it( 'should add a single view to #_unboundChildren', () => {
			expect( view._unboundChildren ).toHaveLength( 0 );

			const child = new View();

			view.registerChild( child );
			expect( view._unboundChildren ).toHaveLength( 1 );
			expect( view._unboundChildren.get( 0 ) ).toBe( child );
		} );

		it( 'should support iterables', () => {
			expect( view._unboundChildren ).toHaveLength( 0 );

			view.registerChild( [ new View(), new View(), new View() ] );
			expect( view._unboundChildren ).toHaveLength( 3 );
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
			expect( view._unboundChildren ).toHaveLength( 2 );

			view.deregisterChild( child2 );
			expect( view._unboundChildren ).toHaveLength( 1 );
			expect( view._unboundChildren.get( 0 ) ).toBe( child1 );
		} );

		it( 'should support iterables', () => {
			const child1 = new View();
			const child2 = new View();
			const child3 = new View();

			view.registerChild( [ child1, child2, child3 ] );
			expect( view._unboundChildren ).toHaveLength( 3 );

			view.deregisterChild( [ child2, child3 ] );
			expect( view._unboundChildren ).toHaveLength( 1 );
			expect( view._unboundChildren.get( 0 ) ).toBe( child1 );
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

			expect( normalizeHtml( view.element.outerHTML ) ).toBe( '<div class="bar"></div>' );
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

			expect( normalizeHtml( view.element.outerHTML ) ).toBe( '<div class="bar"></div>' );
		} );
	} );

	describe( 'render()', () => {
		it( 'is decorated', () => new Promise( done => {
			const view = new View();

			view.on( 'render', () => {
				expect( view.isRendered ).toBe( true );
				done();
			} );

			view.render();
		} ) );

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

			expect( view.isRendered ).toBe( false );

			view.render();
			expect( view.isRendered ).toBe( true );
		} );
	} );

	describe( 'bind', () => {
		beforeEach( () => {
			setTestViewClass();
			setTestViewInstance();
		} );

		it( 'returns a shorthand for Template binding', () => {
			expect( view.bindTemplate.to ).toBeTypeOf( 'function' );
			expect( view.bindTemplate.if ).toBeTypeOf( 'function' );

			const binding = view.bindTemplate.to( 'a' );

			expect( binding.observable ).toBe( view );
			expect( binding.emitter ).toBe( view );
		} );
	} );

	describe( 'element', () => {
		beforeEach( createViewInstanceWithTemplate );

		it( 'invokes out of #template', () => {
			expect( view.element ).toBeInstanceOf( HTMLElement );
			expect( view.element.nodeName ).toBe( 'A' );
		} );

		it( 'can be explicitly declared', () => {
			class CustomView extends View {
				constructor() {
					super();

					this.element = document.createElement( 'span' );
				}
			}

			const view = new CustomView();

			expect( view.element ).toBeInstanceOf( HTMLElement );
		} );

		it( 'is null when there is no template', () => {
			const view = new View();

			view.render();

			expect( view.element ).toBeNull();
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

			expect( view._unboundChildren ).toHaveLength( 0 );

			view.render();

			expect( view._unboundChildren ).toHaveLength( 3 );
			expect( view._unboundChildren.get( 0 ) ).toBe( viewA );
			expect( view._unboundChildren.get( 1 ) ).toBe( viewB );
			expect( view._unboundChildren.get( 2 ) ).toBe( viewC );
		} );
	} );

	describe( 'destroy()', () => {
		beforeEach( createViewWithChildren );

		it( 'can be called multiple times', () => {
			expect( () => {
				view.destroy();
				view.destroy();
				view.destroy();
			} ).not.toThrow();
		} );

		it( 'should not touch the basic properties', () => {
			view.destroy();

			expect( view.element ).toBeInstanceOf( HTMLElement );
			expect( view.template ).toBeInstanceOf( Template );
			expect( view.locale ).toBeTypeOf( 'object' );
			expect( view.locale.t ).toBeTypeOf( 'function' );

			expect( view._viewCollections ).toBeInstanceOf( Collection );
			expect( view._unboundChildren ).toBeInstanceOf( ViewCollection );
		} );

		it( 'should not clear the #_unboundChildren', () => {
			const cached = view._unboundChildren;

			view.registerChild( [ new View(), new View() ] );
			expect( cached ).toHaveLength( 4 );

			view.destroy();
			expect( cached ).toHaveLength( 4 );
		} );

		it( 'should not clear the #_viewCollections', () => {
			const cached = view._viewCollections;

			expect( cached ).toHaveLength( 1 );

			view.destroy();
			expect( cached ).toHaveLength( 1 );
		} );

		it( 'leaves the #element in DOM', () => {
			const elRef = view.element;
			const parentEl = document.createElement( 'div' );

			parentEl.appendChild( view.element );

			view.destroy();
			expect( elRef.parentNode ).toBe( parentEl );
		} );

		it( 'calls destroy() on all view#_viewCollections', () => {
			const collectionA = view.createCollection();
			const collectionB = view.createCollection();

			const spyA = vi.spyOn( collectionA, 'destroy' );
			const spyB = vi.spyOn( collectionB, 'destroy' );

			view.destroy();
			expect( spyA ).toHaveBeenCalledOnce();
			expect( spyB ).toHaveBeenCalledOnce();
			expect( spyA.mock.invocationCallOrder[ 0 ] ).toBeLessThan( spyB.mock.invocationCallOrder[ 0 ] );
		} );

		it( 'destroy a template–less view', () => {
			const view = new View();

			expect( () => {
				view.destroy();
			} ).not.toThrow();
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
