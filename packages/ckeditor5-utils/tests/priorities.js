/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import priorities from '../src/priorities';

describe( 'get', () => {
	it( 'should return correct value for string priority', () => {
		for ( const name in priorities ) {
			if ( priorities.hasOwnProperty( name ) && name != 'get' ) {
				expect( priorities.get( name ) ).to.equal( priorities[ name ] );
			}
		}
	} );

	it( 'should return value equal to normal for unrecognized string priority', () => {
		expect( priorities.get( 'foobar' ) ).to.equal( priorities.normal );
	} );

	it( 'should return passed number', () => {
		expect( priorities.get( 2 ) ).to.equal( 2 );
	} );
} );
