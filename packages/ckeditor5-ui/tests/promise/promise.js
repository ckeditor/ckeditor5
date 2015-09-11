/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

var modules = bender.amd.require( 'promise' );

describe( 'Promise', function() {
	it( 'should resolve properly', function() {
		var Promise = modules.promise;

		var promise = new Promise( function( resolve ) {
			resolve( 1 );
		} );

		return promise.then( function( value ) {
			expect( value ).to.equal( 1 );
		} );
	} );
} );
