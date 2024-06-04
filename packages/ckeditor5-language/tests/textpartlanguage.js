/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import TextPartLanguage from '../src/textpartlanguage.js';
import TextPartLanguageEditing from '../src/textpartlanguageediting.js';
import TextPartLanguageUI from '../src/textpartlanguageui.js';

describe( 'TextPartLanguage', () => {
	it( 'should require TextPartLanguageEditing and TextPartLanguageUI', () => {
		expect( TextPartLanguage.requires ).to.deep.equal( [ TextPartLanguageEditing, TextPartLanguageUI ] );
	} );

	it( 'should be named', () => {
		expect( TextPartLanguage.pluginName ).to.equal( 'TextPartLanguage' );
	} );
} );
