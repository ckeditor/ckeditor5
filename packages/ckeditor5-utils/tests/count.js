/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { describe, it, expect } from 'vitest';
import count from '../src/count.ts';

describe( 'utils', () => {
	describe( 'count', () => {
		it( 'should returns number of editable items', () => {
			const totalNumber = count( [ 1, 2, 3, 4, 5 ] );
			expect( totalNumber ).to.equal( 5 );
		} );
	} );
} );
