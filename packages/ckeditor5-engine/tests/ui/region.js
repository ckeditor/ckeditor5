/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */
/* bender-tags: core, ui */

'use strict';

const modules = bender.amd.require( 'ckeditor', 'ui/region', 'ui/view', 'collection' );

bender.tools.createSinonSandbox();

let TestViewA, TestViewB;
let region, el;

beforeEach( createRegionInstance );

describe( 'constructor', () => {
	it( 'accepts name and element', () => {
		expect( region ).to.have.property( 'name', 'foo' );
		expect( region ).to.have.property( 'el', el );
	} );
} );

describe( 'views collection', () => {
	it( 'is an instance of Collection', () => {
		const Collection = modules.collection;
		expect( region.views ).to.be.an.instanceof( Collection );
	} );

	it( 'updates DOM when adding views', () => {
		expect( region.el.childNodes.length ).to.be.equal( 0 );

		region.views.add( new TestViewA() );
		expect( region.el.childNodes.length ).to.be.equal( 1 );

		region.views.add( new TestViewA() );
		expect( region.el.childNodes.length ).to.be.equal( 2 );
	} );

	it( 'updates DOM when removing views', () => {
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
		// Append the region's element to some container.
		let container = document.createElement( 'div' );
		container.appendChild( el );
		expect( el.parentNode ).to.be.equal( container );

		region.destroy();

		// Make sure destruction of the region does affect passed element.
		expect( el.parentNode ).to.be.equal( container );
		expect( region.el ).to.be.null;
	} );

	it( 'destroys children views', () => {
		let view = new TestViewA();
		let spy = bender.sinon.spy( view, 'destroy' );

		// Append the view to the region.
		region.views.add( view );
		expect( region.views ).to.have.length( 1 );

		region.destroy();

		expect( region.views ).to.have.length( 0 );
		expect( spy.calledOnce ).to.be.true;
	} );
} );

function createRegionInstance() {
	const Region = modules[ 'ui/region' ];
	const View = modules[ 'ui/view' ];

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
	region = new Region( 'foo', el );
}
