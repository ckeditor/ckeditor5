/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import toMap from '../src/tomap';
import count from '../src/count';

describe( 'utils', () => {
	describe( 'toMap', () => {
		it( 'should create map from object', () => {
			const map = toMap( { foo: 1, bar: 2 } );

			expect( count( map ) ).to.equal( 2 );
			expect( map.get( 'foo' ) ).to.equal( 1 );
			expect( map.get( 'bar' ) ).to.equal( 2 );
		} );

		it( 'should create map from iterator', () => {
			const map = toMap( [ [ 'foo', 1 ], [ 'bar', 2 ] ] );

			expect( count( map ) ).to.equal( 2 );
			expect( map.get( 'foo' ) ).to.equal( 1 );
			expect( map.get( 'bar' ) ).to.equal( 2 );
		} );

		it( 'should create map from another map', () => {
			const data = new Map( [ [ 'foo', 1 ], [ 'bar', 2 ] ] );

			const map = toMap( data );

			expect( count( map ) ).to.equal( 2 );
			expect( map.get( 'foo' ) ).to.equal( 1 );
			expect( map.get( 'bar' ) ).to.equal( 2 );
		} );
	} );
} );
