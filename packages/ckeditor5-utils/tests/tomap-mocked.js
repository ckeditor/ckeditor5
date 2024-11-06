/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { describe, it, expect, vi } from 'vitest';
import objectToMap from '../src/objecttomap.ts';
import isIterable from '../src/isiterable.ts';
import toMap from '../src/tomap.ts';

vi.mock( '../src/objecttomap.ts' );
vi.mock( '../src/isiterable.ts' );

describe( 'utils', () => {
	describe( 'toMap (mocked)', () => {
		it( 'should create map from object', () => {
			vi.mocked( isIterable ).mockReturnValue( false );

			toMap( { foo: 1, bar: 2 } );

			expect( isIterable ).toHaveBeenCalledWith( { foo: 1, bar: 2 } );
			expect( objectToMap ).toHaveBeenCalledWith( { foo: 1, bar: 2 } );
		} );

		it( 'should create map from iterator', () => {
			vi.mocked( isIterable ).mockReturnValue( true );

			toMap( [ [ 'foo', 1 ], [ 'bar', 2 ] ] );

			expect( isIterable ).toHaveBeenCalledWith( [ [ 'foo', 1 ], [ 'bar', 2 ] ] );
			expect( objectToMap ).not.toHaveBeenCalled();
		} );
	} );
} );
