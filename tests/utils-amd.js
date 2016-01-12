/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global require */

'use strict';

import testUtils from '/tests/_utils/utils.js';
import amdTestUtils from '/tests/_utils/amd.js';

testUtils.createSinonSandbox();

describe( 'bender.amd', () => {
	const getModulePath = amdTestUtils.getModulePath;

	describe( 'getModulePath()', () => {
		it( 'generates an absolute path', () => {
			const path = getModulePath( 'ckeditor' );

			expect( path ).to.match( /\/ckeditor.js$/, 'ends with /ckeditor.js' );
			expect( path ).to.match( /^\//, 'is absolute' );
		} );
	} );

	describe( 'define()', () => {
		it( 'defines a module by using global define()', () => {
			const spy = testUtils.sinon.spy( window, 'define' );
			const expectedDeps = [ 'exports' ].concat( [ 'bar', 'ckeditor' ].map( getModulePath ) );

			amdTestUtils.define( 'test1', [ 'bar', 'ckeditor' ], () => {} );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 0 ] ).to.equal( getModulePath( 'test1' ) );
			expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( expectedDeps );
		} );

		it( 'maps body args and returned value', () => {
			const spy = testUtils.sinon.spy( window, 'define' );
			const bodySpy = sinon.spy( () => 'ret' );

			amdTestUtils.define( 'test2', [ 'bar', 'ckeditor' ], bodySpy );

			const realBody = spy.args[ 0 ][ 2 ];
			const exportsObj = {};

			expect( realBody ).to.be.a( 'function' );

			realBody( exportsObj, { default: 'arg' } );

			expect( exportsObj ).to.have.property( 'default', 'ret', 'it wraps the ret value with an ES6 module obj' );
			expect( bodySpy.calledOnce ).to.be.true;
			expect( bodySpy.args[ 0 ][ 0 ] ).to.equal( 'arg', 'it unwraps the args' );
		} );

		it( 'works with module name and body', () => {
			const spy = testUtils.sinon.spy( window, 'define' );

			amdTestUtils.define( 'test1', () => {} );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 0 ] ).to.equal( getModulePath( 'test1' ) );
			expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( [ 'exports' ] );
			expect( spy.args[ 0 ][ 2 ] ).to.be.a( 'function' );
		} );

		// Note: this test only checks whether Require.JS doesn't totally fail when creating a circular dependency.
		// The value of dependencies are not available anyway inside the amdTestUtils.define() callbacks because
		// we lose the late-binding by immediately mapping modules to their default exports.
		it( 'works with circular dependencies', ( done ) => {
			amdTestUtils.define( 'test-circular-a', [ 'test-circular-b' ], () => {
				return 'a';
			} );

			amdTestUtils.define( 'test-circular-b', [ 'test-circular-a' ], () => {
				return 'b';
			} );

			require( [ 'test-circular-a', 'test-circular-b' ].map( amdTestUtils.getModulePath ), ( a, b ) => {
				expect( a ).to.have.property( 'default', 'a' );
				expect( b ).to.have.property( 'default', 'b' );

				done();
			} );
		} );
	} );
} );