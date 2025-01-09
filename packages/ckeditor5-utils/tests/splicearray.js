/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import spliceArray from '../src/splicearray.js';

describe( 'utils', () => {
	describe( 'spliceArray', () => {
		it( 'should insert elements at the beginning of the target array', () => {
			const target = [ 1, 2 ];
			const source = [ 3, 4 ];

			spliceArray( target, source, 0 );

			expect( target ).to.have.members( [ 3, 4, 1, 2 ] );
		} );

		it( 'should insert elements in the middle of the target array', () => {
			const target = [ 1, 2 ];
			const source = [ 3, 4 ];

			spliceArray( target, source, 1 );

			expect( target ).to.have.members( [ 1, 3, 4, 2 ] );
		} );

		it( 'should insert elements at the end of the target array', () => {
			const target = [ 1, 2 ];
			const source = [ 3, 4 ];

			spliceArray( target, source, 2 );

			expect( target ).to.have.members( [ 1, 2, 3, 4 ] );
		} );

		it( 'should insert elements into array which contains a large number of elements (250 000)', () => {
			const target = 'a'.repeat( 250000 ).split( '' );
			const source = [ 'b', 'c' ];
			const expectedLength = target.length + source.length;

			spliceArray( target, source, 0 );

			expect( target.length ).to.equal( expectedLength );
			expect( target[ 0 ] ).to.equal( source[ 0 ] );
		} );

		it( 'should insert elements in the middle of the target array which contains a large number of elements (250 000)', () => {
			const target = 'a'.repeat( 250000 ).split( '' );
			const source = [ 'b', 'c' ];

			spliceArray( target, source, 5 );

			expect( target[ 5 ] ).to.equal( source[ 0 ] );
		} );
	} );
} );
