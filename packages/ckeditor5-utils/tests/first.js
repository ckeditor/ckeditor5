/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import first from '../src/first';

describe( 'utils', () => {
	describe( 'first', () => {
		it( 'should return first item', () => {
			const iterator = [ 11, 22 ][ Symbol.iterator ]();

			expect( first( iterator ) ).to.equal( 11 );
		} );

		it( 'should return null if iterator is empty', () => {
			const iterator = [][ Symbol.iterator ]();

			expect( first( iterator ) ).to.be.null;
		} );
	} );
} );
