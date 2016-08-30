/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import normalizeHtml from '/ckeditor5/utils/normalizehtml.js';

describe( 'utils', () => {
	describe( 'normalizeHtml', () => {
		it( 'should sort attributes', () => {
			let actual = '<a style="border:1px;" class="" href="file://"></a>';
			let expected = '<a class="" href="file://" style="border:1px;"></a>';

			expect( normalizeHtml( actual ) ).to.equal( expected );
		} );

		it( 'should normalize styles', () => {
			let actual = '<a style="border:1px"></a>';
			let expected = '<a style="border:1px;"></a>';

			expect( normalizeHtml( actual ) ).to.equal( expected );
		} );

		it( 'should lowercase attributes', () => {
			let actual = '<A CLASS="" HREF="file://" STYLE="border:1px;"></A>';
			let expected = '<a class="" href="file://" style="border:1px;"></a>';

			expect( normalizeHtml( actual ) ).to.equal( expected );
		} );

		it( 'should trim whitespace', () => {
			let actual = '<a class="  " href="file://"      style="border:  1px"></a>';
			let expected = '<a class="" href="file://" style="border:1px;"></a>';

			expect( normalizeHtml( actual ) ).to.equal( expected );
		} );

		it( 'should remove empty style attribute', () => {
			let actual = '<a style=""></a>';
			let expected = '<a></a>';

			expect( normalizeHtml( actual ) ).to.equal( expected );
		} );

		it( 'should leave empty class attribute', () => {
			let actual = '<p class=""></p>';
			let expected = '<p class=""></p>';

			expect( normalizeHtml( actual ) ).to.equal( expected );
		} );

		it( 'should not sort attribute value', () => {
			let actual = '<a class="b c a"></a>';
			let expected = actual;

			expect( normalizeHtml( actual ) ).to.equal( expected );
		} );
	} );
} );
