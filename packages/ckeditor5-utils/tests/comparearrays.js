/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import compareArrays from '/ckeditor5/utils/comparearrays.js';

describe( 'utils', () => {
	describe( 'compareArrays', () => {
		it( 'should return SAME flag, when arrays are same', () => {
			let a = [ 'abc', 0, 3 ];
			let b = [ 'abc', 0, 3 ];

			let result = compareArrays( a, b );

			expect( result ).to.equal( 'SAME' );
		} );

		it( 'should return prefix flag, when all n elements of first array are same as n first elements of the second array', () => {
			let a = [ 'abc', 0 ];
			let b = [ 'abc', 0, 3 ];

			let result = compareArrays( a, b );

			expect( result ).to.equal( 'prefix' );
		} );

		it( 'should return extension flag, when n first elements of first array are same as all elements of the second array', () => {
			let a = [ 'abc', 0, 3 ];
			let b = [ 'abc', 0 ];

			let result = compareArrays( a, b );

			expect( result ).to.equal( 'extension' );
		} );

		it( 'should return index on which arrays differ, when arrays are not the same', () => {
			let a = [ 'abc', 0, 3 ];
			let b = [ 'abc', 1, 3 ];

			let result = compareArrays( a, b );

			expect( result ).to.equal( 1 );
		} );
	} );
} );
