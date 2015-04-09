/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, CKEDITOR */

'use strict';

describe( 'CKEDITOR.require()', function() {
	it( 'should load a CKEditor plugin', function( done ) {
		CKEDITOR.require( [ 'plugin!devtest' ], function( DevTest ) {
			expect( DevTest ).to.have.property( 'isDevTest' );
			done() ;
		} );
	} );

	it( 'should load dependencies on CKEditor plugins', function( done ) {
		CKEDITOR.require( [ 'plugin!devtest/someclass' ], function( SomeClass ) {
			expect( SomeClass ).to.have.property( 'isSomeClass' );
			done() ;
		} );
	} );

	it( 'should load a dependency into a CKEditor plugin', function( done ) {
		CKEDITOR.require( [ 'plugin!devtest', 'plugin!devtest/someclass' ], function( DevTest, SomeClass ) {
			var test = new DevTest();

			expect( test ).to.have.property( 'someProperty' ).to.be.an.instanceof( SomeClass );
			done() ;
		} );
	} );
} );
