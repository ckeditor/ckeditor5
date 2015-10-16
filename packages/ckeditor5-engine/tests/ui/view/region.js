/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */
/* bender-tags: core, ui */

'use strict';

var modules = bender.amd.require( 'ckeditor', 'ui/region', 'ui/view', 'collection' );

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
} );
