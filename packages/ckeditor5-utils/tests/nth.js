/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import nth from '../src/nth';

describe( 'utils', () => {
	describe( 'nth', () => {
		it( 'should return 0th item', () => {
			expect( nth( 0, getGenerator() ) ).to.equal( 11 );
		} );

		it( 'should return the last item', () => {
			expect( nth( 2, getGenerator() ) ).to.equal( 33 );
		} );

		it( 'should return null if out of range (bottom)', () => {
			expect( nth( -1, getGenerator() ) ).to.be.null;
		} );

		it( 'should return null if out of range (top)', () => {
			expect( nth( 3, getGenerator() ) ).to.be.null;
		} );

		it( 'should return null if iterator is empty', () => {
			expect( nth( 0, [] ) ).to.be.null;
		} );

		it( 'should consume the given generator', () => {
			const generator = getGenerator();

			nth( 0, generator );

			expect( generator.next().done ).to.equal( true );
		} );

		it( 'should stop inside the given iterator', () => {
			const collection = [ 11, 22, 33 ];
			const iterator = collection[ Symbol.iterator ]();

			nth( 0, iterator );

			expect( iterator.next().value ).to.equal( 22 );
		} );

		function* getGenerator() {
			yield 11;
			yield 22;
			yield 33;
		}
	} );
} );
