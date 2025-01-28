/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import first from '../src/first.js';

describe( 'utils', () => {
	describe( 'first', () => {
		it( 'should return first item', () => {
			const collection = [ 11, 22 ];
			const iterator = collection[ Symbol.iterator ]();

			expect( first( iterator ) ).to.equal( 11 );
		} );

		it( 'should return null if iterator is empty', () => {
			const collection = [];
			const iterator = collection[ Symbol.iterator ]();

			expect( first( iterator ) ).to.be.null;
		} );

		it( 'should consume the iterating item', () => {
			const collection = [ 11, 22 ];
			const iterator = collection[ Symbol.iterator ]();

			first( iterator );

			expect( iterator.next().value ).to.equal( 22 );
		} );
	} );
} );
