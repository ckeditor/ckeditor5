/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import count from '../src/count.js';

describe( 'utils', () => {
	describe( 'count', () => {
		it( 'should returns number of editable items', () => {
			const totalNumber = count( [ 1, 2, 3, 4, 5 ] );
			expect( totalNumber ).to.equal( 5 );
		} );
	} );
} );
