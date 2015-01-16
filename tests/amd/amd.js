/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, CKEDITOR */

'use strict';

CKEDITOR.define( 'testModule', [ 'ckeditor' ], function( ckeditor ) {
	return {
		test: ( typeof ckeditor == 'object' )
	};
} );

describe( 'amd', function() {
	it( 'require() should work with defined module', function( done ) {
		CKEDITOR.require( [ 'testModule' ], function( testModule ) {
			expect( testModule ).to.have.property( 'test' ).to.be.true();

			done();
		} );
	} );

	it( 'require() should work with core module', function( done ) {
		CKEDITOR.require( [ 'utils' ], function( utils ) {
			expect( utils ).to.be.an( 'object' );
			done();
		} );
	} );
} );
