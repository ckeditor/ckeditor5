/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import spliceArray from '../src/splicearray';

describe( 'utils', () => {
	describe( 'spliceArray', () => {
		it( 'should insert elements at the beginning of the target array', () => {
			const target = [ 1, 2 ];
			const source = [ 3, 4 ];

			const result = spliceArray( target, source, 0, 0 );

			expect( result ).to.have.members( [ 3, 4, 1, 2 ] );
		} );

		it( 'should insert elements in the middle of the target array', () => {
			const target = [ 1, 2 ];
			const source = [ 3, 4 ];

			const result = spliceArray( target, source, 1, 0 );

			expect( result ).to.have.members( [ 1, 3, 4, 2 ] );
		} );

		it( 'should insert elements at the end of the target array', () => {
			const target = [ 1, 2 ];
			const source = [ 3, 4 ];

			const result = spliceArray( target, source, 2, 0 );

			expect( result ).to.have.members( [ 1, 2, 3, 4 ] );
		} );

		it( 'should only splice target array when source is empty', () => {
			const target = [ 1, 2 ];
			const source = [];

			const result = spliceArray( target, source, 0, 1 );

			expect( result ).to.have.members( [ 2 ] );
		} );

		it( 'should insert elements into array which contains a large number of elements (250 000)', () => {
			const target = 'a'.repeat( 250000 ).split( '' );
			const source = [ 'b', 'c' ];
			const expectedLength = target.length + source.length;

			const result = spliceArray( target, source, 0, 0 );

			expect( result.length ).to.equal( expectedLength );
			expect( result[ 0 ] ).to.equal( source[ 0 ] );
		} );

		it( 'should insert elements in the middle of the target array which contains a large number of elements (250 000)', () => {
			const target = 'a'.repeat( 250000 ).split( '' );
			const source = [ 'b', 'c' ];

			const result = spliceArray( target, source, 5, 0 );

			expect( result[ 5 ] ).to.equal( source[ 0 ] );
		} );
	} );
} );
