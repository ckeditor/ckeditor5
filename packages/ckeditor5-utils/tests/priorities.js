/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import priorities from '../src/priorities.js';

describe( 'get', () => {
	it( 'should return correct value for string priority', () => {
		for ( const name in priorities ) {
			if ( Object.prototype.hasOwnProperty.call( priorities, name ) && name != 'get' ) {
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
