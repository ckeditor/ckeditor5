/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { first } from '../src/first.js';

describe( 'utils', () => {
	describe( 'first', () => {
		it( 'should return first item', () => {
			const collection = [ 11, 22 ];
			const iterator = collection[ Symbol.iterator ]();

			expect( first( iterator ) ).toEqual( 11 );
		} );

		it( 'should return null if iterator is empty', () => {
			const collection = [];
			const iterator = collection[ Symbol.iterator ]();

			expect( first( iterator ) ).toBeNull();
		} );

		it( 'should consume the iterating item', () => {
			const collection = [ 11, 22 ];
			const iterator = collection[ Symbol.iterator ]();

			first( iterator );

			expect( iterator.next().value ).toEqual( 22 );
		} );
	} );
} );
