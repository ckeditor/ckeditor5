/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import extend from '/ckeditor5/utils/lib/lodash/extend.js';

describe( 'utils', () => {
	describe( 'extend()', () => {
		// Properties of the subsequent objects should override properties of the preceding objects. This is critical for
		// CKEditor so we keep this test to ensure that Lo-Dash (or whatever) implements it in the way we need it.
		it( 'should extend by several params in the correct order', () => {
			let target = {
				a: 0,
				b: 0
			};

			let ext1 = {
				b: 1,
				c: 1
			};

			let ext2 = {
				c: 2,
				d: 2
			};

			extend( target, ext1, ext2 );

			expect( target ).to.have.property( 'a' ).to.equal( 0 );
			expect( target ).to.have.property( 'b' ).to.equal( 1 );
			expect( target ).to.have.property( 'c' ).to.equal( 2 );
			expect( target ).to.have.property( 'd' ).to.equal( 2 );
		} );
	} );
} );
