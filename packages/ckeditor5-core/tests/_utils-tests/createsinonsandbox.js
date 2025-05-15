/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import testUtils from '../../tests/_utils/utils.js';

const obj = {
	method() {}
};
const origMethod = obj.method;
let spy;

describe( 'testUtils.createSinonSandbox()', () => {
	testUtils.createSinonSandbox();

	it( 'creates a sandbox', () => {
		expect( testUtils.sinon ).to.be.an( 'object' );
		expect( testUtils.sinon ).to.have.property( 'spy' );
	} );

	// This test is needed for the following one.
	it( 'really works', () => {
		spy = testUtils.sinon.spy( obj, 'method' );

		expect( obj ).to.have.property( 'method', spy );
	} );

	it( 'restores spies after each test', () => {
		obj.method();

		sinon.assert.notCalled( spy );
		expect( obj ).to.have.property( 'method', origMethod );
	} );
} );
