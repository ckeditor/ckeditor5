/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { describe, expect, it } from 'vitest';
import { extend } from 'es-toolkit/compat';

describe( 'utils', () => {
	describe( 'extend()', () => {
		// Properties of the subsequent objects should override properties of the preceding objects. This is critical for
		// CKEditor so we keep this test to ensure that Lo-Dash (or whatever) implements it in the way we need it.
		it( 'should extend by several params in the correct order', () => {
			const target = {
				a: 0,
				b: 0
			};

			const ext1 = {
				b: 1,
				c: 1
			};

			const ext2 = {
				c: 2,
				d: 2
			};

			extend( target, ext1, ext2 );

			expect( target ).toHaveProperty( 'a', 0 );
			expect( target ).toHaveProperty( 'b', 1 );
			expect( target ).toHaveProperty( 'c', 2 );
			expect( target ).toHaveProperty( 'd', 2 );
		} );
	} );
} );
