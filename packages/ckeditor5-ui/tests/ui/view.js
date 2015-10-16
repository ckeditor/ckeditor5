/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document, HTMLElement */
/* bender-tags: core, ui */

'use strict';

var modules = bender.amd.require( 'ckeditor', 'ui/view', 'ui/region', 'ckeditorerror', 'model' );

bender.tools.createSinonSandbox();

describe( 'View', function() {
	var view;
	var View;
	var TestView;

	beforeEach( 'Create a test view instance', function() {
		View = modules[ 'ui/view' ];

		view = new View( {
			a: 'foo',
			b: 42
		} );

		class T extends View {
			constructor() {
				super();
				this.template = { tag: 'a' };
			}
		}

		TestView = T;
	} );

	it( 'accepts the model', function() {
		expect( view.model ).to.be.an.instanceof( modules.model );

		expect( view ).to.have.deep.property( 'model.a', 'foo' );
		expect( view ).to.have.deep.property( 'model.b', 42 );
	} );

	it( 'has no default element', function() {
		expect( () => view.el ).to.throw( modules.ckeditorerror );
	} );

	it( 'has no default template', function() {
		expect( view.template ).to.be.undefined();
	} );

	it( 'has no default regions', function() {
		expect( view.regions ).to.have.length( 0 );
	} );

	it( 'provides binding to the model', function() {
		var spy = sinon.spy();
		var callback = view.bind( 'a', spy );

		expect( spy.called ).to.be.false;

		callback( 'el', 'updater' );
		sinon.assert.calledOnce( spy );
		sinon.assert.calledWithExactly( spy, 'el', 'foo' );

		spy.reset();
		view.model.a = 'bar';
		sinon.assert.calledOnce( spy );
		sinon.assert.calledWithExactly( spy, 'el', 'bar' );
	} );

	it( 'renders element from template', function() {
		view = new TestView( { a: 1 } );

		expect( view.el ).to.be.an.instanceof( HTMLElement );
		expect( view.el.nodeName ).to.be.equal( 'A' );
	} );

	it( 'destroys properly', function() {
		view = new TestView( { a: 1 } );

		// Append the views's element to some container.
		var container = document.createElement( 'div' );
		container.appendChild( view.el );

		expect( view.el.nodeName ).to.be.equal( 'A' );
		expect( view.el ).to.be.an.instanceof( HTMLElement );
		expect( view.el.parentNode ).to.be.equal( container );
		expect( view.model ).to.be.an.instanceof( modules.model );

		view.destroy();

		expect( view.el ).to.be.an.instanceof( HTMLElement );
		expect( view.el.parentNode ).to.be.null;
		expect( view.model ).to.be.null;
	} );

	it( 'destroys child regions', function() {
		var Region = modules[ 'ui/region' ];
		var region = new Region();
		var spy = bender.sinon.spy( region, 'destroy' );

		view.regions.add( region );
		view.destroy();

		expect( view.regions ).to.have.length( 0 );
		expect( spy.calledOnce ).to.be.true;
	} );
} );
