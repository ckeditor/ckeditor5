/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
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

	it( 'should have `isOfficialPlugin` static flag set to `true`', () => {
		expect( TextPartLanguage.isOfficialPlugin ).to.be.true;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( TextPartLanguage.isPremiumPlugin ).to.be.false;
	} );
} );
