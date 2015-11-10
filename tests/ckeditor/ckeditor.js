/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'ckeditor', 'ckeditor-core' );

describe( 'getPluginPath()', function() {
	it( 'should return a proper path', function() {
		const CKEDITOR = modules.ckeditor;

		const basePath = CKEDITOR.basePath;
		const path = CKEDITOR.getPluginPath( 'test' );

		if ( CKEDITOR.isDev ) {
			expect( path ).to.equal( basePath + 'node_modules/ckeditor-plugin-test/src/' );
		} else {
			expect( path ).to.equal( basePath + 'plugins/test/' );
		}
	} );

	it( '(the production version) should work even when in dev', function() {
		const CKEDITOR = modules.ckeditor;
		const core = modules[ 'ckeditor-core' ];

		// To be able to run this test on both dev and production code, we need to override getPluginPath with the
		// core version of it and restore it after testing.
		const originalGetPluginPath = CKEDITOR.getPluginPath;
		CKEDITOR.getPluginPath = core.getPluginPath;

		// This test is good for both the development and production codes.
		const basePath = CKEDITOR.basePath;
		const path = CKEDITOR.getPluginPath( 'test' );

		// Revert the override before assertions or it will not do it in case of errors.
		CKEDITOR.getPluginPath = originalGetPluginPath;

		expect( path ).to.equal( basePath + 'plugins/test/' );
	} );
} );

describe( 'isDebug', function() {
	it( 'is a boolean', function() {
		const CKEDITOR = modules.ckeditor;

		expect( CKEDITOR.isDebug ).to.be.a( 'boolean' );
	} );
} );
