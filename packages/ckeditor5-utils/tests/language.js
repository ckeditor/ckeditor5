/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { getLanguageDirection } from '../src/language';

describe( 'language', () => {
	describe( 'getLanguageDirection()', () => {
		[
			// Common LTR languages.
			{ code: 'en', textDirection: 'ltr' },
			{ code: 'pl', textDirection: 'ltr' },
			{ code: 'fr', textDirection: 'ltr' },

			// Arabic
			{ code: 'ar', textDirection: 'rtl' },
			{ code: 'ara', textDirection: 'rtl' },

			// Persian
			{ code: 'fa', textDirection: 'rtl' },
			{ code: 'per', textDirection: 'rtl' },
			{ code: 'fas', textDirection: 'rtl' },

			// Hebrew
			{ code: 'he', textDirection: 'rtl' },
			{ code: 'heb', textDirection: 'rtl' },

			// Kurdish
			{ code: 'ku', textDirection: 'rtl' },
			{ code: 'kur', textDirection: 'rtl' },

			// Uighur, Uyghur
			{ code: 'ug', textDirection: 'rtl' },
			{ code: 'uig', textDirection: 'rtl' }
		].forEach( ( { code, textDirection } ) => {
			it( `determines the "${ code }" language direction`, () => {
				expect( getLanguageDirection( code ) ).to.equal( textDirection );
			} );
		} );
	} );
} );
