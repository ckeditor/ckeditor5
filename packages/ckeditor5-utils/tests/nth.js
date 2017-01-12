/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import nth from 'ckeditor5-utils/src/nth';

describe( 'utils', () => {
	describe( 'nth', () => {
		it( 'should return 0th item', () => {
			expect( nth( 0, getIterator() ) ).to.equal( 11 );
		} );

		it( 'should return the last item', () => {
			expect( nth( 2, getIterator() ) ).to.equal( 33 );
		} );

		it( 'should return null if out of range (bottom)', () => {
			expect( nth( -1, getIterator() ) ).to.be.null;
		} );

		it( 'should return null if out of range (top)', () => {
			expect( nth( 3, getIterator() ) ).to.be.null;
		} );

		it( 'should return null if iterator is empty', () => {
			expect( nth( 0, [] ) ).to.be.null;
		} );

		function *getIterator() {
			yield 11;
			yield 22;
			yield 33;
		}
	} );
} );
