/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import CellSpans from '../src/cellspans';

describe( 'CellSpans', () => {
	let cellSpans;

	beforeEach( () => {
		cellSpans = new CellSpans();
	} );

	describe( 'recordSpans()', () => {
		it( 'should record spans relatively to a provided cell index with proper cellspan value', () => {
			cellSpans.recordSpans( 0, 0, 2, 2 );

			expect( cellSpans._spans.size ).to.equal( 1 );
			expect( cellSpans._spans.has( 1 ) ).to.be.true;
			expect( cellSpans._spans.get( 1 ).size ).to.equal( 1 );
			expect( cellSpans._spans.get( 1 ).get( 0 ) ).to.equal( 2 );
		} );

		it( 'should record spans for the same row in the same map', () => {
			cellSpans.recordSpans( 0, 0, 2, 2 );
			cellSpans.recordSpans( 0, 3, 2, 7 );

			expect( cellSpans._spans.has( 1 ) ).to.be.true;
			expect( cellSpans._spans.get( 1 ).size ).to.equal( 2 );
			expect( cellSpans._spans.get( 1 ).get( 3 ) ).to.equal( 7 );
		} );
	} );

	describe( 'drop()', () => {
		it( 'should remove rows', () => {
			cellSpans.recordSpans( 0, 0, 4, 1 );

			expect( cellSpans._spans.size ).to.equal( 3 );
			expect( cellSpans._spans.has( 0 ) ).to.be.false;
			expect( cellSpans._spans.has( 1 ) ).to.be.true;
			expect( cellSpans._spans.has( 2 ) ).to.be.true;
			expect( cellSpans._spans.has( 3 ) ).to.be.true;
			expect( cellSpans._spans.has( 4 ) ).to.be.false;

			cellSpans.drop( 2 );

			expect( cellSpans._spans.size ).to.equal( 2 );
			expect( cellSpans._spans.has( 0 ) ).to.be.false;
			expect( cellSpans._spans.has( 1 ) ).to.be.true;
			expect( cellSpans._spans.has( 2 ) ).to.be.false;
			expect( cellSpans._spans.has( 3 ) ).to.be.true;
		} );

		it( 'should do nothing if there was no spans recoreder', () => {
			cellSpans.recordSpans( 0, 0, 3, 1 );

			expect( cellSpans._spans.size ).to.equal( 2 );

			cellSpans.drop( 1 );
			expect( cellSpans._spans.size ).to.equal( 1 );

			cellSpans.drop( 1 );
			expect( cellSpans._spans.size ).to.equal( 1 );
		} );
	} );

	describe( 'getNextFreeColumnIndex()', () => {
		it( 'should return the same column index as provided when no spans recorded', () => {
			expect( cellSpans.getAdjustedColumnIndex( 1, 1 ) ).to.equal( 1 );
		} );

		it( 'should return adjusted column index by the size of overlaping rowspan', () => {
			cellSpans.recordSpans( 0, 1, 2, 8 );

			expect( cellSpans.getAdjustedColumnIndex( 1, 1 ) ).to.equal( 9 );
		} );
	} );
} );
