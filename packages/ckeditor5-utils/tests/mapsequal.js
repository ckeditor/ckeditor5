/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import mapsEqual from '../src/mapsequal.js';

describe( 'utils', () => {
	describe( 'mapsEqual', () => {
		let mapA, mapB;

		beforeEach( () => {
			mapA = new Map();
			mapB = new Map();
		} );

		it( 'should return true if maps have exactly same entries (order of adding does not matter)', () => {
			mapA.set( 'foo', 'bar' );
			mapA.set( 'abc', 'xyz' );

			mapB.set( 'abc', 'xyz' );
			mapB.set( 'foo', 'bar' );

			expect( mapsEqual( mapA, mapB ) ).to.be.true;
		} );

		it( 'should return false if maps size is not the same', () => {
			mapA.set( 'foo', 'bar' );
			mapA.set( 'abc', 'xyz' );

			mapB.set( 'abc', 'xyz' );

			expect( mapsEqual( mapA, mapB ) ).to.be.false;
		} );

		it( 'should return false if maps entries are not exactly the same', () => {
			mapA.set( 'foo', 'bar' );
			mapA.set( 'abc', 'xyz' );

			mapB.set( 'foo', 'bar' );
			mapB.set( 'xyz', 'abc' );

			expect( mapsEqual( mapA, mapB ) ).to.be.false;
		} );
	} );
} );
