/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { toArray } from '../src/toarray.js';

describe( 'utils', () => {
	describe( 'toArray', () => {
		it( 'should wrap non-array values in an array', () => {
			expect( toArray( 0 ) ).toEqual( [ 0 ] );
			expect( toArray( 1 ) ).toEqual( [ 1 ] );
			expect( toArray( '' ) ).toEqual( [ '' ] );
			expect( toArray( 'foo' ) ).toEqual( [ 'foo' ] );
			expect( toArray( false ) ).toEqual( [ false ] );
			expect( toArray( true ) ).toEqual( [ true ] );
			expect( toArray( null ) ).toEqual( [ null ] );
			expect( toArray( {} ) ).toEqual( [ {} ] );
			expect( toArray() ).toEqual( [ undefined ] );
		} );

		it( 'should return array values by reference and unchanged', () => {
			const array = toArray( [ 'foo' ] );

			expect( toArray( array ) ).toEqual( array );
			expect( toArray( array ) ).toEqual( [ 'foo' ] );
		} );
	} );
} );
