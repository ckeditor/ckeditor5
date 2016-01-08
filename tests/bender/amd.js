/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global require */

'use strict';

bender.tools.createSinonSandbox();

describe( 'bender.amd', () => {
	const getModulePath = bender.amd.getModulePath;

	describe( 'getModulePath()', () => {
		// Thanks to this we'll check whether all paths are relative to ckeditor.js path.
		const basePath = getModulePath( 'ckeditor' ).replace( /\/ckeditor\.js$/, '/' );

		it( 'generates path for the main file', () => {
			const path = getModulePath( 'ckeditor' );

			expect( path ).to.match( /\/ckeditor.js$/, 'ends with /ckeditor.js' );
			expect( path ).to.match( /^\//, 'is absolute' );
		} );

		it( 'generates path for modules within ckeditor5 package', () => {
			const path = getModulePath( 'ckeditor5/foo' );

			expect( path ).to.equal( basePath + 'ckeditor5/foo.js' );
		} );

		it( 'generates path for modules within the core package', () => {
			const path = getModulePath( 'core/ui/controller' );

			expect( path ).to.equal( basePath + 'ckeditor5-core/ui/controller.js' );
		} );

		it( 'generates path for modules within some package', () => {
			const path = getModulePath( 'some/ba' );

			expect( path ).to.equal( basePath + 'ckeditor5-some/ba.js' );
		} );

		it( 'generates path from simplified feature name', () => {
			const path = getModulePath( 'foo' );

			expect( path ).to.equal( basePath + 'ckeditor5-foo/foo.js' );
		} );
	} );

	describe( 'define()', () => {
		it( 'defines a module by using global define()', () => {
			const spy = bender.sinon.spy( window, 'define' );
			const expectedDeps = [ 'exports' ].concat( [ 'bar', 'ckeditor' ].map( getModulePath ) );

			bender.amd.define( 'test1', [ 'bar', 'ckeditor' ], () => {} );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 0 ] ).to.equal( getModulePath( 'test1' ) );
			expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( expectedDeps );
		} );

		it( 'maps body args and returned value', () => {
			const spy = bender.sinon.spy( window, 'define' );
			const bodySpy = sinon.spy( () => 'ret' );

			bender.amd.define( 'test2', [ 'bar', 'ckeditor' ], bodySpy );

			const realBody = spy.args[ 0 ][ 2 ];
			const exportsObj = {};

			expect( realBody ).to.be.a( 'function' );

			realBody( exportsObj, { default: 'arg' } );

			expect( exportsObj ).to.have.property( 'default', 'ret', 'it wraps the ret value with an ES6 module obj' );
			expect( bodySpy.calledOnce ).to.be.true;
			expect( bodySpy.args[ 0 ][ 0 ] ).to.equal( 'arg', 'it unwraps the args' );
		} );

		it( 'works with module name and body', () => {
			const spy = bender.sinon.spy( window, 'define' );

			bender.amd.define( 'test1', () => {} );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 0 ] ).to.equal( getModulePath( 'test1' ) );
			expect( spy.args[ 0 ][ 1 ] ).to.deep.equal( [ 'exports' ] );
			expect( spy.args[ 0 ][ 2 ] ).to.be.a( 'function' );
		} );

		// Note: this test only checks whether Require.JS doesn't totally fail when creating a circular dependency.
		// The value of dependencies are not available anyway inside the bender.amd.define() callbacks because
		// we lose the late-binding by immediately mapping modules to their default exports.
		it( 'works with circular dependencies', ( done ) => {
			bender.amd.define( 'test-circular-a', [ 'test-circular-b' ], () => {
				return 'a';
			} );

			bender.amd.define( 'test-circular-b', [ 'test-circular-a' ], () => {
				return 'b';
			} );

			require( [ 'test-circular-a', 'test-circular-b' ].map( bender.amd.getModulePath ), ( a, b ) => {
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

			bender.sinon.stub( bender, 'defer', () => deferCbSpy );
			bender.sinon.stub( window, 'require', ( deps, cb ) => {
				requireCb = cb;
			} );

			const modules = bender.amd.require( 'foo', 'bar' );

			expect( deferCbSpy.called ).to.be.false;

			requireCb( { default: 1 }, { default: 2 } );

			expect( deferCbSpy.calledOnce ).to.be.true;

			expect( modules ).to.have.property( 'foo', 1 );
			expect( modules ).to.have.property( 'bar', 2 );
		} );
	} );
} );