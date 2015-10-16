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

	beforeEach( 'Create a test region instance', function() {
		var Region = modules[ 'ui/region' ];

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
		var View = modules[ 'ui/view' ];

		class TestView extends View {
			constructor() {
				super();
				this.template = { tag: 'b' };
			}
		}

		expect( region.el.childNodes.length ).to.be.equal( 0 );

		region.views.add( new TestView() );
		expect( region.el.childNodes.length ).to.be.equal( 1 );

		region.views.add( new TestView() );
		expect( region.el.childNodes.length ).to.be.equal( 2 );
	} );

	it( 'removes views from collection', function() {
		var View = modules[ 'ui/view' ];

		class TestViewA extends View {
			constructor() {
				super();
				this.template = { tag: 'a' };
			}
		}

		class TestViewB extends View {
			constructor() {
				super();
				this.template = { tag: 'b' };
			}
		}

		var tva = new TestViewA();
		var tvb = new TestViewB();

		region.views.add( tva );
		region.views.add( tvb );

		var childNodes = region.el.childNodes;

		expect( [].map.call( childNodes, n => n.nodeName ).join( ',' ) ).to.be.equal( 'A,B' );

		region.views.remove( tva );
		expect( [].map.call( childNodes, n => n.nodeName ).join( ',' ) ).to.be.equal( 'B' );

		region.views.remove( tvb );
		expect( childNodes.length ).to.be.equal( 0 );
	} );

	it( 'is destroyed properly', function() {
		var View = modules[ 'ui/view' ];

		class TestView extends View {
			constructor() {
				super();
				this.template = { tag: 'a' };
			}
		}

		var view = new TestView();
		var spy = bender.sinon.spy( view, 'destroy' );

		region.views.add( view );
		expect( region.views ).to.have.length( 1 );

		region.destroy();

		expect( region.el ).to.be.null;
		expect( region.views ).to.have.length( 0 );
		expect( spy.calledOnce ).to.be.true;
	} );
} );
