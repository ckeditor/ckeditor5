/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import normalizeHtml from '../../tests/_utils/normalizehtml';

describe( 'utils', () => {
	describe( 'normalizeHtml', () => {
		it( 'should sort attributes', () => {
			const actual = '<a style="padding:1px" class="" href="file://"></a>';
			const expected = '<a class="" href="file://" style="padding:1px"></a>';

			expect( normalizeHtml( actual ) ).to.equal( expected );
		} );

		it( 'should normalize styles', () => {
			const actual = '<a style="padding:1px"></a>';
			const expected = '<a style="padding:1px"></a>';

			expect( normalizeHtml( actual ) ).to.equal( expected );
		} );

		it( 'should lowercase attributes', () => {
			const actual = '<A CLASS="" HREF="file://" STYLE="padding:1px"></A>';
			const expected = '<a class="" href="file://" style="padding:1px"></a>';

			expect( normalizeHtml( actual ) ).to.equal( expected );
		} );

		it( 'should trim whitespace', () => {
			const actual = '<a class="  " href="file://"      style="padding:  1px"></a>';
			const expected = '<a class="" href="file://" style="padding:1px"></a>';

			expect( normalizeHtml( actual ) ).to.equal( expected );
		} );

		it( 'should remove empty style attribute', () => {
			const actual = '<a style=""></a>';
			const expected = '<a></a>';

			expect( normalizeHtml( actual ) ).to.equal( expected );
		} );

		it( 'should leave empty class attribute', () => {
			const actual = '<p class=""></p>';
			const expected = '<p class=""></p>';

			expect( normalizeHtml( actual ) ).to.equal( expected );
		} );

		it( 'should sort attribute value', () => {
			const actual = '<a class="b c a"></a>';
			const expected = '<a class="a b c"></a>';

			expect( normalizeHtml( actual ) ).to.equal( expected );
		} );
	} );
} );
