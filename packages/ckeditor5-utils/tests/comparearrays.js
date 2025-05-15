/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import compareArrays from '../src/comparearrays.js';

describe( 'utils', () => {
	describe( 'compareArrays', () => {
		it( 'should return same flag, when arrays are same', () => {
			const a = [ 'abc', 0, 3 ];
			const b = [ 'abc', 0, 3 ];

			const result = compareArrays( a, b );

			expect( result ).to.equal( 'same' );
		} );

		it( 'should return prefix flag, when all n elements of first array are same as n first elements of the second array', () => {
			const a = [ 'abc', 0 ];
			const b = [ 'abc', 0, 3 ];

			const result = compareArrays( a, b );

			expect( result ).to.equal( 'prefix' );
		} );

		it( 'should return extension flag, when n first elements of first array are same as all elements of the second array', () => {
			const a = [ 'abc', 0, 3 ];
			const b = [ 'abc', 0 ];

			const result = compareArrays( a, b );

			expect( result ).to.equal( 'extension' );
		} );

		it( 'should return index on which arrays differ, when arrays are not the same', () => {
			const a = [ 'abc', 0, 3 ];
			const b = [ 'abc', 1, 3 ];

			const result = compareArrays( a, b );

			expect( result ).to.equal( 1 );
		} );
	} );
} );
