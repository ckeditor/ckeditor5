/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import toArray from '../src/toarray.js';

describe( 'utils', () => {
	describe( 'toArray', () => {
		it( 'should wrap non-array values in an array', () => {
			expect( toArray( 0 ) ).to.deep.equal( [ 0 ] );
			expect( toArray( 1 ) ).to.deep.equal( [ 1 ] );
			expect( toArray( '' ) ).to.deep.equal( [ '' ] );
			expect( toArray( 'foo' ) ).to.deep.equal( [ 'foo' ] );
			expect( toArray( false ) ).to.deep.equal( [ false ] );
			expect( toArray( true ) ).to.deep.equal( [ true ] );
			expect( toArray( null ) ).to.deep.equal( [ null ] );
			expect( toArray( {} ) ).to.deep.equal( [ {} ] );
			expect( toArray() ).to.deep.equal( [ undefined ] );
		} );

		it( 'should return array values by reference and unchanged', () => {
			const array = toArray( [ 'foo' ] );

			expect( toArray( array ) ).to.equal( array );
			expect( toArray( array ) ).to.deep.equal( [ 'foo' ] );
		} );
	} );
} );
