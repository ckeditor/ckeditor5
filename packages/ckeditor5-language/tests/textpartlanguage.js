/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import TextPartLanguage from '../src/textpartlanguage';
import TextPartLanguageEditing from '../src/textpartlanguageediting';
import TextPartLanguageUI from '../src/textpartlanguageui';

describe( 'TextPartLanguage', () => {
	it( 'should require TextPartLanguageEditing and TextPartLanguageUI', () => {
		expect( TextPartLanguage.requires ).to.deep.equal( [ TextPartLanguageEditing, TextPartLanguageUI ] );
	} );

	it( 'should be named', () => {
		expect( TextPartLanguage.pluginName ).to.equal( 'TextPartLanguage' );
	} );
} );
