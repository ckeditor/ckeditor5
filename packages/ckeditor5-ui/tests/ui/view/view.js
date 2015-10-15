/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: core, ui */

'use strict';

var modules = bender.amd.require( 'ckeditor', 'ui/view' );

describe( 'View', function() {
	var view;

	beforeEach( 'Create a test view instance', function() {
		var View = modules[ 'ui/view' ];

		view = new View( {
			a: 'foo',
			b: 42
		} );
	} );

	it( 'accepts the model', function() {
		expect( view ).to.have.deep.property( 'model.a', 'foo' );
		expect( view ).to.have.deep.property( 'model.b', 42 );
	} );

	it( 'has no default element', function() {
		expect( view.el ).to.be.null();
	} );

	it( 'has no default template', function() {
		expect( view.template ).to.be.undefined();
	} );

	it( 'has no default regions', function() {
		expect( view.regions.length ).to.be.equal( 0 );
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
} );
