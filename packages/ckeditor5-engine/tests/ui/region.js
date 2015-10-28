/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */
/* bender-tags: core, ui */

'use strict';

var modules = bender.amd.require( 'ckeditor', 'ui/region', 'ui/view', 'collection' );

bender.tools.createSinonSandbox();

var TestViewA, TestViewB;
var region, el;

beforeEach( createRegionInstance );

describe( 'constructor', function() {
	it( 'accepts name and element', function() {
		expect( region ).to.have.property( 'name', 'foo' );
		expect( region ).to.have.property( 'el', el );
	} );
} );

describe( 'views collection', function() {
	it( 'is an instance of Collection', function() {
		var Collection = modules.collection;
		expect( region.views ).to.be.an.instanceof( Collection );
	} );

	it( 'updates DOM when adding views', function() {
		expect( region.el.childNodes.length ).to.be.equal( 0 );

		region.views.add( new TestViewA() );
		expect( region.el.childNodes.length ).to.be.equal( 1 );

		region.views.add( new TestViewA() );
		expect( region.el.childNodes.length ).to.be.equal( 2 );
	} );

	it( 'updates DOM when removing views', function() {
		var viewA = new TestViewA();
		var viewB = new TestViewB();

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

describe( 'destroy', function() {
	it( 'destroys the region', function() {
		// Append the region's element to some container.
		var container = document.createElement( 'div' );
		container.appendChild( el );
		expect( el.parentNode ).to.be.equal( container );

		region.destroy();

		// Make sure destruction of the region does affect passed element.
		expect( el.parentNode ).to.be.equal( container );
		expect( region.el ).to.be.null;
	} );

	it( 'destroys children views', function() {
		var view = new TestViewA();
		var spy = bender.sinon.spy( view, 'destroy' );

		// Append the view to the region.
		region.views.add( view );
		expect( region.views ).to.have.length( 1 );

		region.destroy();

		expect( region.views ).to.have.length( 0 );
		expect( spy.calledOnce ).to.be.true;
	} );
} );

function createRegionInstance() {
	var Region = modules[ 'ui/region' ];
	var View = modules[ 'ui/view' ];

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
