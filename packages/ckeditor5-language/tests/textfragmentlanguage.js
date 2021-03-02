/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import TextFragmentLanguage from '../src/textfragmentlanguage';
import TextFragmentLanguageEditing from '../src/textfragmentlanguageediting';
import TextFragmentLanguageUI from '../src/textfragmentlanguageui';

describe( 'TextFragmentLanguage', () => {
	it( 'should require TextFragmentLanguageEditing and TextFragmentLanguageUI', () => {
		expect( TextFragmentLanguage.requires ).to.deep.equal( [ TextFragmentLanguageEditing, TextFragmentLanguageUI ] );
	} );

	it( 'should be named', () => {
		expect( TextFragmentLanguage.pluginName ).to.equal( 'TextFragmentLanguage' );
	} );
} );
