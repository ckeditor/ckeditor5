/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global require, process */

import testUtils from '/tests/ckeditor5/_utils/utils.js';
import moduleTestUtils from '/tests/ckeditor5/_utils/module.js';

testUtils.createSinonSandbox();

const path = require( 'path' );
const cjsDir = path.join( process.cwd(), 'build', 'cjs' );

describe( 'module utilities', () => {
	const getModulePath = moduleTestUtils.getModulePath;

	describe( 'getModulePath()', () => {
		it( 'generates absolute path from a plugin name', () => {
			const modulePath = getModulePath( 'foo' );

			expect( modulePath ).to.equal( path.join( cjsDir,  '/ckeditor5/foo/foo.js' ) );
		} );

		it( 'generates an absolute path from a simple path', () => {
			const modulePath = getModulePath( 'core/editor' );

			expect( modulePath ).to.equal( path.join( cjsDir, '/ckeditor5/core/editor.js' ) );
		} );

		it( 'does not process an absolute path', () => {
			const modulePath = getModulePath( '/foo/bar/bom.js' );

			expect( modulePath ).to.equal( path.join( cjsDir, '/foo/bar/bom.js' ) );
		} );
	} );

	describe( 'define()', () => {
		it( 'defines a module using mockery', () => {
			const mockery = require( 'mockery' );
			const spy = testUtils.sinon.spy( mockery, 'registerMock' );

			moduleTestUtils.define( 'test1', [ '/ckeditor.js', 'bar' ],  () => {}  );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 0 ] ).to.equal( getModulePath( 'test1' ) );
		} );

		it( 'works with module name and body', () => {
			const mockery = require( 'mockery' );
			const spy = testUtils.sinon.spy( mockery, 'registerMock' );
			const bodySpy = testUtils.sinon.spy( () => {} );

			moduleTestUtils.define( 'test1', bodySpy );

			expect( spy.calledOnce ).to.be.true;
			expect( spy.args[ 0 ][ 0 ] ).to.equal( getModulePath( 'test1' ) );
			expect( bodySpy.calledOnce ).to.be.true;

			// No dependencies are passed - check if no arguments were passed to the function.
			expect( bodySpy.args[ 0 ].length ).to.equal( 0 );
		} );

		// Note: this test only checks whether CommonJS version of `define()` doesn't totally fail when creating a
		// circular dependency. The value of dependencies are not available anyway inside the
		// amdTestUtils.define() callbacks because we lose the late-binding by immediately mapping modules to
		// their default exports.
		it( 'works with circular dependencies', () => {
			moduleTestUtils.define( 'test-circular-a', [ 'test-circular-b' ], () => {
				return 'a';
			} );

			moduleTestUtils.define( 'test-circular-b', [ 'test-circular-a' ], () => {
				return 'b';
			} );

			const a = require( moduleTestUtils.getModulePath( 'test-circular-a' ) );
			expect( a ).to.have.property( 'default', 'a' );

			const b = require( moduleTestUtils.getModulePath( 'test-circular-b' ) );
			expect( b ).to.have.property( 'default', 'b' );
		} );
	} );

	describe( 'require', () => {
		it( 'creates object with loaded modules', () => {
			// Create first module using mockery library.
			const mockery = require( 'mockery' );
			mockery.registerMock( moduleTestUtils.getModulePath( 'module1' ), { default: 'foo' } );

			// Create second module using define.
			moduleTestUtils.define( 'module2', () => 'bar' );

			const loadedModules = moduleTestUtils.require( { module1: 'module1',  module2: 'module2' } );

			expect( loadedModules.module1 ).to.equal( 'foo' );
			expect( loadedModules.module2 ).to.equal( 'bar' );
		} );
	} );
} );
