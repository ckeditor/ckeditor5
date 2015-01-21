/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, CKEDITOR, window */

'use strict';

describe( 'Promise', function() {
	it( 'should resolve properly', function( done ) {
		CKEDITOR.require( [ 'promise' ], function( Promise ) {
			var promise = new Promise( function( resolve ) {
				// Fake an asynchronous operation.
				window.setTimeout( function() {
					resolve( 1 );
				}, 0 );
			} );

			promise.then( function( value ) {
				// then() catches errors, so we need to delay the execution.
				window.setTimeout( function() {
					expect( value ).to.equal( 1 );
					done();
				} );
			} );
		} );
	} );
} );
