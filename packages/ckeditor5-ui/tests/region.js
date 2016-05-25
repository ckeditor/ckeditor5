/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */
/* bender-tags: ui */

'use strict';

import Region from '/ckeditor5/ui/region.js';
import View from '/ckeditor5/ui/view.js';

let TestViewA, TestViewB;
let region, el;

describe( 'View', () => {
	beforeEach( createRegionInstance );

	describe( 'constructor', () => {
		it( 'accepts name', () => {
			expect( region.name ).to.be.equal( 'foo' );
			expect( region.element ).to.be.null;
			expect( region.views.length ).to.be.equal( 0 );
		} );
	} );

	describe( 'init', () => {
		it( 'accepts region element', () => {
			region.init( el );

			expect( region.element ).to.be.equal( el );
		} );
	} );

	describe( 'views collection', () => {
		it( 'updates DOM when adding views', () => {
			let view;

			region.init( el );

			expect( region.element.childNodes.length ).to.be.equal( 0 );

			view = new TestViewA();
			region.views.add( view, 0 );
			expect( region.element.childNodes.length ).to.be.equal( 1 );

			region.views.add( new TestViewA() );
			expect( region.element.childNodes.length ).to.be.equal( 2 );

			view = new TestViewA();
			region.views.add( view, 1 );
			expect( region.element.childNodes.length ).to.be.equal( 3 );
			expect( region.element.childNodes[ 1 ] ).to.equal( view.element );

			view = new TestViewA();
			region.views.add( view, 0 );
			expect( region.element.childNodes.length ).to.be.equal( 4 );
			expect( region.element.childNodes[ 0 ] ).to.equal( view.element );
		} );

		it( 'does not update DOM when no region element', () => {
			region.init();

			expect( () => {
				region.views.add( new TestViewA() );
				region.views.add( new TestViewA() );
			} ).to.not.throw();
		} );

		it( 'updates DOM when removing views', () => {
			region.init( el );

			let viewA = new TestViewA();
			let viewB = new TestViewB();

			region.views.add( viewA );
			region.views.add( viewB );

			expect( el.childNodes.length ).to.be.equal( 2 );
			expect( el.firstChild.nodeName ).to.be.equal( 'A' );
			expect( el.lastChild.nodeName ).to.be.equal( 'B' );

			region.views.remove( viewA );
			expect( el.childNodes.length ).to.be.equal( 1 );
			expect( el.firstChild.nodeName ).to.be.equal( 'B' );

			region.views.remove( viewB );
			expect( el.childNodes.length ).to.be.equal( 0 );
		} );
	} );

	describe( 'destroy', () => {
		it( 'destroys the region', () => {
			region.init( el );
			region.views.add( new TestViewA() );

			const elRef = region.element;
			const viewsRef = region.views;

			region.destroy();

			expect( elRef.parentNode ).to.be.null;
			expect( region.name ).to.be.equal( 'foo' );
			expect( region.views ).to.be.null;
			expect( viewsRef.length ).to.be.equal( 0 );
			expect( region.element ).to.be.null;
		} );

		it( 'destroys an element–less region', () => {
			region.init();

			expect( () => {
				region.destroy();
			} ).to.not.throw();
		} );
	} );
} );

function createRegionInstance() {
	class A extends View {
		constructor() {
			super();
			this.template = { tag: 'a' };
		}
	}

	class B extends View {
		constructor() {
			super();
			this.template = { tag: 'b' };
		}
	}

	TestViewA = A;
	TestViewB = B;

	el = document.createElement( 'div' );

	region = new Region( 'foo' );
}
