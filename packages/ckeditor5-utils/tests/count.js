/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import count from '/ckeditor5/utils/count.js';

describe( 'utils', () => {
	describe( 'count', () => {
		it( 'should returns number of editable items', () => {
			const totalNumber = count( [ 1, 2, 3, 4, 5 ] );
			expect( totalNumber ).to.equal( 5 );
		} );
	} );
} );
