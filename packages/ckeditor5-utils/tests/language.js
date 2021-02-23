/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getLanguageDirection } from '../src/language';

describe( 'language', () => {
	describe( 'getLanguageDirection', () => {
		it( 'determines the language direction', () => {
			expect( getLanguageDirection( 'en' ) ).to.eql( 'ltr' );
			expect( getLanguageDirection( 'pl' ) ).to.eql( 'ltr' );
			expect( getLanguageDirection( 'fr' ) ).to.eql( 'ltr' );

			expect( getLanguageDirection( 'ar' ) ).to.eql( 'rtl' );
			expect( getLanguageDirection( 'ara' ) ).to.eql( 'rtl' );

			expect( getLanguageDirection( 'fa' ) ).to.eql( 'rtl' );
			expect( getLanguageDirection( 'per' ) ).to.eql( 'rtl' );
			expect( getLanguageDirection( 'fas' ) ).to.eql( 'rtl' );

			expect( getLanguageDirection( 'he' ) ).to.eql( 'rtl' );
			expect( getLanguageDirection( 'heb' ) ).to.eql( 'rtl' );

			expect( getLanguageDirection( 'ku' ) ).to.eql( 'rtl' );
			expect( getLanguageDirection( 'kur' ) ).to.eql( 'rtl' );

			expect( getLanguageDirection( 'ug' ) ).to.eql( 'rtl' );
			expect( getLanguageDirection( 'uig' ) ).to.eql( 'rtl' );
		} );
	} );
} );
