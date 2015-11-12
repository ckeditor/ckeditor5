/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

describe( 'CKEDITOR.require()', () => {
	it( 'should load a CKEditor plugin', ( done ) => {
		CKEDITOR.require( [ 'plugin!devtest' ], ( DevTest ) => {
			expect( DevTest ).to.have.property( 'isDevTest' );
			done();
		} );
	} );

	it( 'should load dependencies on CKEditor plugins', ( done ) => {
		CKEDITOR.require( [ 'plugin!devtest/someclass' ], ( SomeClass ) => {
			expect( SomeClass ).to.have.property( 'isSomeClass' );
			done();
		} );
	} );

	it( 'should load a dependency into a CKEditor plugin', ( done ) => {
		CKEDITOR.require( [ 'plugin!devtest', 'plugin!devtest/someclass' ], ( DevTest, SomeClass ) => {
			const test = new DevTest();

			expect( test ).to.have.property( 'someProperty' ).to.be.an.instanceof( SomeClass );
			done();
		} );
	} );
} );
