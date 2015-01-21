/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, CKEDITOR */

'use strict';

describe( 'getPluginPath()', function() {
	it( 'should return a proper path', function( done ) {
		CKEDITOR.require( [ 'ckeditor' ], function( CKEDITOR ) {
			var basePath = CKEDITOR.basePath;
			var path = CKEDITOR.getPluginPath( 'test' );

			if ( CKEDITOR.isDev ) {
				expect( path ).equals( basePath + 'node_modules/ckeditor-plugin-test/src/' );
			} else {
				expect( path ).equals( basePath + 'plugins/test/' );
			}
			done();
		} );
	} );

	it( '(the production version) should work even when in dev', function( done ) {
		CKEDITOR.require( [ 'ckeditor', 'ckeditor-core' ], function( CKEDITOR, core ) {
			// To be able to run this test on both dev and production code, we need to override getPluginPath with the
			// core version of it and restore it after testing.
			var originalGetPluginPath = CKEDITOR.getPluginPath;
			CKEDITOR.getPluginPath = core.getPluginPath;

			// This test is good for both the development and production codes.
			var basePath = CKEDITOR.basePath;
			var path = CKEDITOR.getPluginPath( 'test' );

			expect( path ).equals( basePath + 'plugins/test/' );

			CKEDITOR.getPluginPath = originalGetPluginPath;

			done();
		} );
	} );
} );
