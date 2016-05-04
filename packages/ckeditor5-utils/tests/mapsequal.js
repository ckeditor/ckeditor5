/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import mapsEqual from '/ckeditor5/utils/mapsequal.js';

describe( 'utils', () => {
	describe( 'mapsEqual', () => {
		it( 'should return true if maps have exactly same entries (order of adding does not matter)', () => {
			let mapA = new Map();
			let mapB = new Map();

			mapA.set( 'foo', 'bar' );
			mapA.set( 'abc', 'xyz' );

			mapB.set( 'abc', 'xyz' );
			mapB.set( 'foo', 'bar' );

			expect( mapsEqual( mapA, mapB ) ).to.be.true;
		} );
	} );
} );
