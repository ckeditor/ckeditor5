/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */
/* bender-tags: core, ui */

'use strict';

var modules = bender.amd.require( 'ckeditor', 'ui/region', 'ui/view', 'collection' );

bender.tools.createSinonSandbox();

describe( 'Region', function() {
	var region;
	var el;

	var TestViewA;
	var TestViewB;

	beforeEach( 'Create a test region instance', function() {
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
	} );

	it( 'accepts constructor paramaters', function() {
		expect( region ).to.have.property( 'name', 'foo' );
		expect( region ).to.have.property( 'el', el );
	} );

	it( 'has views collection', function() {
		var Collection = modules.collection;
		expect( region.views ).to.be.an.instanceof( Collection );
	} );

	it( 'adds views to collection', function() {
		expect( region.el.childNodes.length ).to.be.equal( 0 );

		region.views.add( new TestViewA() );
		expect( region.el.childNodes.length ).to.be.equal( 1 );

		region.views.add( new TestViewA() );
		expect( region.el.childNodes.length ).to.be.equal( 2 );
	} );

	it( 'removes views from collection', function() {
		var viewA = new TestViewA();
		var viewB = new TestViewB();

		region.views.add( viewA );
		region.views.add( viewB );

		var childNodes = region.el.childNodes;

		expect( [].map.call( childNodes, n => n.nodeName ).join( ',' ) ).to.be.equal( 'A,B' );

		region.views.remove( viewA );
		expect( [].map.call( childNodes, n => n.nodeName ).join( ',' ) ).to.be.equal( 'B' );

		region.views.remove( viewB );
		expect( childNodes.length ).to.be.equal( 0 );
	} );

	it( 'destroys properly', function() {
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
