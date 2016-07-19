/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global require, bender */

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import moduleTestUtils from '/tests/ckeditor5/_utils/module.js';

testUtils.createSinonSandbox();

describe( 'amdTestUtils', () => {
	const getModulePath = moduleTestUtils.getModulePath;

	describe( 'getModulePath()', () => {
		it( 'generates a path from a simple name', () => {
			const path = getModulePath( 'foo' );

			expect( path ).to.equal( '/ckeditor5/foo.js' );
		} );

		it( 'generates an absolute path from a simple path', () => {
			const path = getModulePath( 'engine/dataController' );

			expect( path ).to.equal( '/ckeditor5/engine/dataController.js' );
		} );

		it( 'does not process an absolute path', () => {
			const path = getModulePath( '/foo/bar/bom.js' );

			expect( path ).to.equal( '/foo/bar/bom.js' );
		} );
	} );

	describe( 'define()', () => {
		it( 'defines a module by using global define()', () => {
			const spy = testUtils.sinon.spy( window, 'define' );
			const expectedDeps = [ 'exports' ].concat( [ 'bar', 'ckeditor' ].map( getModulePath ) );

			moduleTestUtils.define( 'test1', [ 'bar', 'ckeditor' ], () => {} );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 0 ] ).to.equal( getModulePath( 'test1' ) );
			expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( expectedDeps );
		} );

		it( 'maps body args and returned value', () => {
			const spy = testUtils.sinon.spy( window, 'define' );
			const bodySpy = sinon.spy( () => 'ret' );

			moduleTestUtils.define( 'test2', [ 'bar', 'ckeditor' ], bodySpy );

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

			moduleTestUtils.define( 'test1', () => {} );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 0 ] ).to.equal( getModulePath( 'test1' ) );
			expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( [ 'exports' ] );
			expect( spy.args[ 0 ][ 2 ] ).to.be.a( 'function' );
		} );

		// Note: this test only checks whether Require.JS doesn't totally fail when creating a circular dependency.
		// The value of dependencies are not available anyway inside the amdTestUtils.define() callbacks because
		// we lose the late-binding by immediately mapping modules to their default exports.
		it( 'works with circular dependencies', ( done ) => {
			moduleTestUtils.define( 'test-circular-a', [ 'test-circular-b' ], () => {
				return 'a';
			} );

			moduleTestUtils.define( 'test-circular-b', [ 'test-circular-a' ], () => {
				return 'b';
			} );

			require( [ 'test-circular-a', 'test-circular-b' ].map( moduleTestUtils.getModulePath ), ( a, b ) => {
				expect( a ).to.have.property( 'default', 'a' );
				expect( b ).to.have.property( 'default', 'b' );

				done();
			} );
		} );
	} );

	describe( 'require', () => {
		it( 'blocks Bender and loads modules through global require()', () => {
			let requireCb;
			const deferCbSpy = sinon.spy();

			testUtils.sinon.stub( bender, 'defer', () => deferCbSpy );
			testUtils.sinon.stub( window, 'require', ( deps, cb ) => {
				requireCb = cb;
			} );

			const modules = moduleTestUtils.require( { foo: 'foo/oof', bar: 'bar' } );

			expect( deferCbSpy.called ).to.be.false;

			requireCb( { default: 1 }, { default: 2 } );

			expect( deferCbSpy.calledOnce ).to.be.true;

			expect( modules ).to.have.property( 'foo', 1 );
			expect( modules ).to.have.property( 'bar', 2 );
		} );
	} );
} );
