/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

CKEDITOR.define( 'testModule', [ 'ckeditor' ], ( ckeditor ) => {
	return {
		test: ( ckeditor && ( typeof ckeditor == 'object' ) )
	};
} );

describe( 'CKEDITOR.require()', () => {
	it( 'should work with a defined module', ( done ) => {
		CKEDITOR.require( [ 'testModule' ], ( testModule ) => {
			expect( testModule ).to.have.property( 'test' ).to.be.true();
			done();
		} );
	} );

	it( 'should work with a core module', ( done ) => {
		CKEDITOR.require( [ 'utils' ], ( utils ) => {
			expect( utils ).to.be.an( 'object' );
			done();
		} );
	} );
} );
