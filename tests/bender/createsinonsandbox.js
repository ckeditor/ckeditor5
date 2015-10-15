/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

var obj = {
	method() {}
};
var spy;
var origMethod = obj.method;

bender.tools.createSinonSandbox();

describe( 'bender.tools.createSinonSandbox()', function() {
	it( 'creates a sandbox', function() {
		expect( bender.sinon ).to.be.an( 'object' );
		expect( bender.sinon ).to.have.property( 'spy' );
	} );

	// This test is needed for the following one.
	it( 'really works', function() {
		spy = bender.sinon.spy( obj, 'method' );

		expect( obj ).to.have.property( 'method', spy );
	} );

	it( 'restores spies after each test', function() {
		obj.method();

		sinon.assert.notCalled( spy );
		expect( obj ).to.have.property( 'method', origMethod );
	} );
} );
