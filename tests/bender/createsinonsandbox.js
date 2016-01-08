/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const obj = {
	method() {}
};
const origMethod = obj.method;
let spy;

bender.tools.createSinonSandbox();

describe( 'bender.tools.createSinonSandbox()', () => {
	it( 'creates a sandbox', () => {
		expect( bender.sinon ).to.be.an( 'object' );
		expect( bender.sinon ).to.have.property( 'spy' );
	} );

	// This test is needed for the following one.
	it( 'really works', () => {
		spy = bender.sinon.spy( obj, 'method' );

		expect( obj ).to.have.property( 'method', spy );
	} );

	it( 'restores spies after each test', () => {
		obj.method();

		sinon.assert.notCalled( spy );
		expect( obj ).to.have.property( 'method', origMethod );
	} );
} );
