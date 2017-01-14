/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import count from '../src/count';

describe( 'utils', () => {
	describe( 'count', () => {
		it( 'should returns number of editable items', () => {
			const totalNumber = count( [ 1, 2, 3, 4, 5 ] );
			expect( totalNumber ).to.equal( 5 );
		} );
	} );
} );
