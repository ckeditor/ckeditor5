/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Model } from '../../src/model/model.js';
import { ModelText } from '../../src/model/text.js';
import { compareMarkersForDowncast } from '../../src/conversion/comparemarkers.js';

describe( 'compareMarkersForDowncast()', () => {
	let model, root;

	beforeEach( () => {
		model = new Model();
		root = model.document.createRoot();

		root._appendChild( [
			new ModelText( 'abcdefghij' )
		] );
	} );

	function range( startOffset, endOffset ) {
		return model.createRange(
			model.createPositionFromPath( root, [ startOffset ] ),
			model.createPositionFromPath( root, [ endOffset ] )
		);
	}

	function sortedNames( markers ) {
		return markers.sort( compareMarkersForDowncast ).map( ( [ name ] ) => name );
	}

	describe( 'non-overlapping ranges', () => {
		it( 'should sort in reverse DOM order', () => {
			expect( sortedNames( [
				[ 'a', range( 0, 2 ) ],
				[ 'b', range( 4, 6 ) ],
				[ 'c', range( 7, 9 ) ]
			] ) ).to.deep.equal( [ 'c', 'b', 'a' ] );
		} );

		it( 'should sort in reverse DOM order regardless of initial order', () => {
			expect( sortedNames( [
				[ 'c', range( 7, 9 ) ],
				[ 'a', range( 0, 2 ) ],
				[ 'b', range( 4, 6 ) ]
			] ) ).to.deep.equal( [ 'c', 'b', 'a' ] );
		} );

		it( 'should treat adjacent ranges (end == start) as non-overlapping', () => {
			expect( sortedNames( [
				[ 'first', range( 0, 3 ) ],
				[ 'second', range( 3, 6 ) ],
				[ 'third', range( 6, 9 ) ]
			] ) ).to.deep.equal( [ 'third', 'second', 'first' ] );
		} );
	} );

	describe( 'overlapping ranges', () => {
		it( 'should sort outer marker after inner marker (outer starts earlier)', () => {
			expect( sortedNames( [
				[ 'inner', range( 3, 5 ) ],
				[ 'outer', range( 1, 7 ) ]
			] ) ).to.deep.equal( [ 'inner', 'outer' ] );
		} );

		it( 'should sort by start position first for partially overlapping ranges', () => {
			expect( sortedNames( [
				[ 'earlier', range( 1, 5 ) ],
				[ 'later', range( 3, 7 ) ]
			] ) ).to.deep.equal( [ 'later', 'earlier' ] );
		} );

		it( 'should use end position as secondary key when starts are equal', () => {
			// Same start — the longer range (ending later) sorts first, shorter after.
			expect( sortedNames( [
				[ 'shorter', range( 2, 4 ) ],
				[ 'longer', range( 2, 6 ) ]
			] ) ).to.deep.equal( [ 'longer', 'shorter' ] );
		} );

		it( 'should sort three nested markers from innermost to outermost', () => {
			expect( sortedNames( [
				[ 'outer', range( 0, 9 ) ],
				[ 'mid', range( 2, 7 ) ],
				[ 'inner', range( 4, 5 ) ]
			] ) ).to.deep.equal( [ 'inner', 'mid', 'outer' ] );
		} );

		it( 'should sort three nested markers from innermost to outermost regardless of initial order', () => {
			expect( sortedNames( [
				[ 'inner', range( 4, 5 ) ],
				[ 'outer', range( 0, 9 ) ],
				[ 'mid', range( 2, 7 ) ]
			] ) ).to.deep.equal( [ 'inner', 'mid', 'outer' ] );
		} );
	} );

	describe( 'identical ranges', () => {
		it( 'should fall back to reverse name comparison for identical ranges', () => {
			expect( sortedNames( [
				[ 'alpha', range( 2, 5 ) ],
				[ 'charlie', range( 2, 5 ) ],
				[ 'bravo', range( 2, 5 ) ]
			] ) ).to.deep.equal( [ 'charlie', 'bravo', 'alpha' ] );
		} );

		it( 'should preserve order for markers with identical ranges and names', () => {
			const markers = [
				[ 'same', range( 2, 5 ) ],
				[ 'same', range( 2, 5 ) ]
			];

			const result = compareMarkersForDowncast( markers[ 0 ], markers[ 1 ] );

			expect( result ).to.equal( 0 );
		} );
	} );

	describe( 'mixed scenarios', () => {
		it( 'should correctly sort a mix of non-overlapping and overlapping ranges', () => {
			expect( sortedNames( [
				[ 'solo', range( 8, 9 ) ],
				[ 'outer', range( 0, 6 ) ],
				[ 'inner', range( 2, 4 ) ]
			] ) ).to.deep.equal( [ 'solo', 'inner', 'outer' ] );
		} );

		it( 'should correctly sort overlapping ranges sharing the same start with a non-overlapping range', () => {
			expect( sortedNames( [
				[ 'short', range( 0, 3 ) ],
				[ 'long', range( 0, 7 ) ],
				[ 'separate', range( 8, 9 ) ]
			] ) ).to.deep.equal( [ 'separate', 'long', 'short' ] );
		} );

		it( 'should sort many markers consistently regardless of initial order', () => {
			const expected = [ 'e', 'd', 'c', 'b', 'a' ];

			// Reversed initial order.
			expect( sortedNames( [
				[ 'a', range( 0, 2 ) ],
				[ 'b', range( 2, 4 ) ],
				[ 'c', range( 4, 6 ) ],
				[ 'd', range( 6, 8 ) ],
				[ 'e', range( 8, 10 ) ]
			] ) ).to.deep.equal( expected );

			// Random initial order.
			expect( sortedNames( [
				[ 'c', range( 4, 6 ) ],
				[ 'e', range( 8, 10 ) ],
				[ 'a', range( 0, 2 ) ],
				[ 'd', range( 6, 8 ) ],
				[ 'b', range( 2, 4 ) ]
			] ) ).to.deep.equal( expected );
		} );
	} );
} );
